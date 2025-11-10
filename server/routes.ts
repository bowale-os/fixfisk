import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommentSchema, updatePostStatusSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import { z } from "zod";
import { Resend } from 'resend';
import { supabaseAnon, supabaseAdmin } from './supabase';

// Email validation schema for @my.fisk.edu
const emailSchema = z.object({
  email: z.string().email().refine(
    (email) => email.toLowerCase().endsWith('@my.fisk.edu'),
    { message: 'Email must be from @my.fisk.edu domain' }
  ),
});

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Middleware to require SGA admin
export async function requireSGAAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || !user.isSGAAdmin) {
    return res.status(403).json({ message: 'SGA admin access required' });
  }
  
  next();
}

// Generate a secure random token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/magic-link', async (req: Request, res: Response) => {
    try {
      const { email } = emailSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase();
      
      // Use Supabase Auth with anon key to send magic link (user-facing operation)
      const { data, error } = await supabaseAnon.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${req.protocol}://${req.get('host')}/api/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Supabase magic link error:', error);
        return res.status(500).json({ message: 'Failed to send magic link' });
      }
      
      console.log('\n🔗 Magic Link sent to', normalizedEmail, 'via Supabase Auth\n');
      
      res.json({ 
        message: 'Magic link sent! Check your email.',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Magic link error:', error);
      res.status(500).json({ message: 'Failed to send magic link' });
    }
  });

  // Supabase auth callback route
  app.get('/api/auth/callback', async (req: Request, res: Response) => {
    try {
      const { token_hash, type } = req.query;
      
      if (!token_hash || typeof token_hash !== 'string') {
        return res.redirect('/?auth=error');
      }

      // Verify the OTP token with Supabase admin client (server-side verification)
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        token_hash,
        type: type === 'magiclink' ? 'magiclink' : 'email',
      });
      
      if (error || !data.user) {
        console.error('Supabase verify error:', error);
        return res.redirect('/?auth=error');
      }
      
      const email = data.user.email;
      if (!email) {
        return res.redirect('/?auth=error');
      }
      
      // Find or create user in our database
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email });
      }
      
      // Create session
      req.session.userId = user.id;
      
      // Redirect to app with success
      res.redirect('/?auth=success');
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('/?auth=error');
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        id: user.id,
        email: user.email,
        isSGAAdmin: user.isSGAAdmin,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Post routes
  app.post('/api/posts', requireAuth, async (req: Request, res: Response) => {
    try {
      const { title, content, tags, isAnonymous, imageUrl } = req.body;
      
      if (!title || !content || !tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ message: 'Title, content, and at least one tag are required' });
      }
      
      const post = await storage.createPost({
        userId: req.session.userId!,
        title,
        content,
        tags,
        isAnonymous: isAnonymous || false,
        imageUrl,
        status: 'pending',
      });
      
      res.json(post);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Failed to create post' });
    }
  });

  app.get('/api/posts', async (req: Request, res: Response) => {
    try {
      const { tags, status, sortBy, limit } = req.query;
      const userId = req.session.userId;
      
      const posts = await storage.getPosts({
        tags: tags ? (typeof tags === 'string' ? [tags] : tags as string[]) : undefined,
        status: typeof status === 'string' ? status : undefined,
        sortBy: typeof sortBy === 'string' ? sortBy : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      // Add hasUpvoted flag for authenticated users
      if (userId) {
        const postsWithVotes = await Promise.all(
          posts.map(async (post) => {
            const vote = await storage.getVote(userId, post.id);
            return { ...post, hasUpvoted: !!vote };
          })
        );
        return res.json(postsWithVotes);
      }
      
      res.json(posts.map(post => ({ ...post, hasUpvoted: false })));
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ message: 'Failed to get posts' });
    }
  });

  app.patch('/api/posts/:postId/status', requireSGAAdmin, async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      
      // Validate request body
      const { status, sgaResponse } = updatePostStatusSchema.parse(req.body);
      
      // Update post status
      const updatedPost = await storage.updatePost(postId, {
        status,
        sgaResponse,
      });
      
      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // Create notification for post author (if not anonymous and not their own post)
      if (updatedPost.userId !== req.session.userId) {
        await storage.createNotification({
          userId: updatedPost.userId,
          type: 'status_update',
          postId: updatedPost.id,
          title: 'Status Updated',
          message: `SGA updated your post status to: ${status.replace('_', ' ')}`,
        });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Failed to update post status' });
    }
  });

  app.post('/api/posts/:postId/vote', requireAuth, async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      
      // Add vote - let database unique constraint enforce one vote per user
      await storage.addVoteToPost(userId, postId);
      
      res.json({ message: 'Vote added successfully' });
    } catch (error: any) {
      // Handle unique constraint violation (user already voted)
      // PostgreSQL: error code 23505
      // SQLite: error code SQLITE_CONSTRAINT or SQLITE_CONSTRAINT_UNIQUE
      if (
        error.code === '23505' ||
        error.code === 'SQLITE_CONSTRAINT' ||
        error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error.message?.includes('duplicate') ||
        error.message?.includes('UNIQUE constraint failed')
      ) {
        return res.json({ message: 'Vote already exists' });
      }
      console.error('Vote error:', error);
      res.status(500).json({ message: 'Failed to add vote' });
    }
  });

  app.delete('/api/posts/:postId/vote', requireAuth, async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      
      // Remove vote - idempotent operation
      await storage.removeVoteFromPost(userId, postId);
      
      res.json({ message: 'Vote removed successfully' });
    } catch (error) {
      console.error('Unvote error:', error);
      res.status(500).json({ message: 'Failed to remove vote' });
    }
  });

  // Comment routes
  app.post('/api/posts/:postId/comments', requireAuth, async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      
      // Validate request body
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId,
        postId,
      });
      
      // Create comment and increment counter
      const comment = await storage.addCommentToPost(validatedData);
      
      // Get post to notify author
      const post = await storage.getPost(postId);
      
      // Create notification for post author (if not commenting on own post)
      if (post && post.userId !== userId) {
        await storage.createNotification({
          userId: post.userId,
          type: 'comment',
          postId: post.id,
          commentId: comment.id,
          title: 'New Comment',
          message: `Someone commented on your post: "${post.title}"`,
        });
      }
      
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid comment data', errors: error.errors });
      }
      console.error('Comment creation error:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  app.get('/api/posts/:postId/comments', async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId;
      
      // Get comments for post
      const comments = await storage.getCommentsByPost(postId);
      
      // Enrich with author email and hasUpvoted flag
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          // Get author email
          let authorEmail: string | undefined;
          if (!comment.isAnonymous) {
            const author = await storage.getUser(comment.userId);
            authorEmail = author?.email;
          }
          
          // Check if current user has upvoted (if authenticated)
          let hasUpvoted = false;
          if (userId) {
            const vote = await storage.getVote(userId, undefined, comment.id);
            hasUpvoted = !!vote;
          }
          
          return {
            ...comment,
            authorEmail,
            hasUpvoted,
          };
        })
      );
      
      res.json(enrichedComments);
    } catch (error) {
      console.error('Failed to get comments:', error);
      res.status(500).json({ message: 'Failed to get comments' });
    }
  });

  // Comment voting routes
  app.post('/api/comments/:commentId/vote', requireAuth, async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const userId = req.session.userId!;
      
      // Add vote - let database unique constraint enforce one vote per user
      await storage.addVoteToComment(userId, commentId);
      
      res.json({ message: 'Vote added successfully' });
    } catch (error: any) {
      // Handle unique constraint violation (user already voted)
      if (
        error.code === '23505' ||
        error.code === 'SQLITE_CONSTRAINT' ||
        error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error.message?.includes('duplicate') ||
        error.message?.includes('UNIQUE constraint failed')
      ) {
        return res.json({ message: 'Vote already exists' });
      }
      console.error('Comment vote error:', error);
      res.status(500).json({ message: 'Failed to add vote' });
    }
  });

  app.delete('/api/comments/:commentId/vote', requireAuth, async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const userId = req.session.userId!;
      
      // Remove vote - idempotent operation
      await storage.removeVoteFromComment(userId, commentId);
      
      res.json({ message: 'Vote removed successfully' });
    } catch (error) {
      console.error('Comment unvote error:', error);
      res.status(500).json({ message: 'Failed to remove vote' });
    }
  });

  // Notification routes
  app.get('/api/notifications', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Failed to get notifications' });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  app.post('/api/notifications/mark-all-read', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      await storage.markAllNotificationsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
