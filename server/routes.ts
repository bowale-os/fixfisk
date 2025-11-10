import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { insertCommentSchema, updatePostStatusSchema } from "@shared/schema";
import { z } from "zod";
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
  
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('isSGAAdmin')
    .eq('id', req.session.userId)
    .single();
    
  if (!user || !user.isSGAAdmin) {
    return res.status(403).json({ message: 'SGA admin access required' });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/magic-link', async (req: Request, res: Response) => {
    try {
      const { email } = emailSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase();
      
      // Get the redirect URL (where Supabase will send users after clicking the link)
      // Make sure to include the full URL with protocol
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      const redirectTo = `${protocol}://${host}/api/auth/callback`;
      
      console.log('Sending magic link with redirect:', redirectTo);
      
      // Send magic link via Supabase
      const { error } = await supabaseAnon.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
        }
      });
      
      if (error) {
        console.error('Supabase magic link error:', error);
        return res.status(500).json({ message: 'Failed to send magic link' });
      }
      
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

  app.get('/api/auth/callback', async (req: Request, res: Response) => {
    try {
      // When user clicks magic link, Supabase redirects here with these params
      const token_hash = req.query.token_hash as string;
      const type = req.query.type as string;
      
      console.log('Auth callback received:', { token_hash: !!token_hash, type });
      
      if (!token_hash) {
        console.error('No token_hash in callback');
        return res.redirect('/?auth=failed');
      }

      if (type !== 'magiclink') {
        console.error('Invalid type:', type);
        return res.redirect('/?auth=failed');
      }
      
      // Verify the token with Supabase using admin client
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        token_hash,
        type: 'magiclink'
      });
      
      if (error || !data.user) {
        console.error('Supabase verification error:', error);
        return res.redirect('/?auth=failed');
      }
      
      const supabaseUser = data.user;
      const email = supabaseUser.email!;
      const supabaseUserId = supabaseUser.id;
      
      console.log('User verified:', email);
      
      // Find or create user in Supabase database
      let { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!user) {
        console.log('Creating new user in database');
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({ 
            id: supabaseUserId,
            email,
            isSGAAdmin: false 
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating user:', createError);
          return res.redirect('/?auth=error');
        }
        user = newUser;
      }
      
      // Create session
      req.session.userId = user.id;
      
      console.log('Session created, redirecting to success');
      
      // Redirect to the app with success message
      return res.redirect('/?auth=success');
      
    } catch (error) {
      console.error('Verify token error:', error);
      return res.redirect('/?auth=error');
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
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, isSGAAdmin')
        .eq('id', req.session.userId!)
        .single();
        
      if (error || !user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
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
      
      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .insert({
          userId: req.session.userId!,
          title,
          content,
          tags,
          isAnonymous: isAnonymous || false,
          imageUrl,
          status: 'pending',
        })
        .select()
        .single();
        
      if (error) {
        console.error('Create post error:', error);
        return res.status(500).json({ message: 'Failed to create post' });
      }
      
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
      
      let query = supabaseAdmin
        .from('posts')
        .select(`
          *,
          users!posts_userId_fkey(email)
        `);
      
      // Filter by tags if provided
      if (tags) {
        const tagArray = typeof tags === 'string' ? [tags] : tags as string[];
        query = query.contains('tags', tagArray);
      }
      
      // Filter by status if provided
      if (status && typeof status === 'string') {
        query = query.eq('status', status);
      }
      
      // Limit results (before sorting for trending)
      const limitNum = limit ? parseInt(limit as string) : 100;
      query = query.limit(limitNum);
      
      const { data: postsData, error } = await query;
      
      if (error) {
        console.error('Get posts error:', error);
        return res.status(500).json({ message: 'Failed to get posts' });
      }
      
      // Process posts with author email
      let posts = postsData.map(post => ({
        ...post,
        authorEmail: post.isAnonymous ? undefined : post.users?.email,
        users: undefined // Remove the joined user data
      }));
      
      // Sort posts
      if (sortBy === 'recent') {
        posts = posts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === 'popular') {
        posts = posts.sort((a, b) => b.upvoteCount - a.upvoteCount);
      } else {
        // Trending: weighted score favoring newer posts with upvotes
        // Score = upvotes / ((hours_since_creation + 2) ^ 1.5)
        posts = posts.sort((a, b) => {
          const now = Date.now();
          const hoursA = (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
          const hoursB = (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
          const scoreA = a.upvoteCount / Math.pow(hoursA + 2, 1.5);
          const scoreB = b.upvoteCount / Math.pow(hoursB + 2, 1.5);
          return scoreB - scoreA;
        });
      }
      
      // Add hasUpvoted flag for authenticated users
      if (userId) {
        const postsWithVotes = await Promise.all(
          posts.map(async (post) => {
            const { data: vote } = await supabaseAdmin
              .from('votes')
              .select('*')
              .eq('userId', userId)
              .eq('postId', post.id)
              .maybeSingle();
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
      const { data: updatedPost, error } = await supabaseAdmin
        .from('posts')
        .update({ status, sgaResponse })
        .eq('id', postId)
        .select()
        .single();
      
      if (error || !updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // Create notification for post author (if not their own post)
      if (updatedPost.userId !== req.session.userId) {
        await supabaseAdmin
          .from('notifications')
          .insert({
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
      
      // Check if vote already exists
      const { data: existingVote } = await supabaseAdmin
        .from('votes')
        .select('*')
        .eq('userId', userId)
        .eq('postId', postId)
        .maybeSingle();
        
      if (existingVote) {
        return res.json({ message: 'Vote already exists' });
      }
      
      // Add vote
      const { error: voteError } = await supabaseAdmin
        .from('votes')
        .insert({ userId, postId });
        
      if (voteError) {
        console.error('Vote error:', voteError);
        return res.status(500).json({ message: 'Failed to add vote' });
      }
      
      // Increment post upvotes
      await supabaseAdmin.rpc('increment_post_upvotes', { post_id: postId });
      
      res.json({ message: 'Vote added successfully' });
    } catch (error: any) {
      console.error('Vote error:', error);
      res.status(500).json({ message: 'Failed to add vote' });
    }
  });

  app.delete('/api/posts/:postId/vote', requireAuth, async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      
      // Remove vote
      const { error: voteError } = await supabaseAdmin
        .from('votes')
        .delete()
        .eq('userId', userId)
        .eq('postId', postId);
        
      if (voteError) {
        console.error('Unvote error:', voteError);
        return res.status(500).json({ message: 'Failed to remove vote' });
      }
      
      // Decrement post upvotes
      await supabaseAdmin.rpc('decrement_post_upvotes', { post_id: postId });
      
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
      
      // Create comment
      const { data: comment, error } = await supabaseAdmin
        .from('comments')
        .insert(validatedData)
        .select()
        .single();
        
      if (error) {
        console.error('Comment creation error:', error);
        return res.status(500).json({ message: 'Failed to create comment' });
      }
      
      // Increment comment count
      await supabaseAdmin.rpc('increment_post_comments', { post_id: postId });
      
      // Get post to notify author
      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      // Create notification for post author (if not commenting on own post)
      if (post && post.userId !== userId) {
        await supabaseAdmin
          .from('notifications')
          .insert({
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
      const { data: comments, error } = await supabaseAdmin
        .from('comments')
        .select('*')
        .eq('postId', postId)
        .order('createdAt', { ascending: true });
        
      if (error) {
        console.error('Failed to get comments:', error);
        return res.status(500).json({ message: 'Failed to get comments' });
      }
      
      // Enrich with author email and hasUpvoted flag
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          // Get author email
          let authorEmail: string | undefined;
          if (!comment.isAnonymous) {
            const { data: author } = await supabaseAdmin
              .from('users')
              .select('email')
              .eq('id', comment.userId)
              .single();
            authorEmail = author?.email;
          }
          
          // Check if current user has upvoted (if authenticated)
          let hasUpvoted = false;
          if (userId) {
            const { data: vote } = await supabaseAdmin
              .from('votes')
              .select('*')
              .eq('userId', userId)
              .eq('commentId', comment.id)
              .maybeSingle();
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
      
      // Check if vote already exists
      const { data: existingVote } = await supabaseAdmin
        .from('votes')
        .select('*')
        .eq('userId', userId)
        .eq('commentId', commentId)
        .maybeSingle();
        
      if (existingVote) {
        return res.json({ message: 'Vote already exists' });
      }
      
      // Add vote
      const { error: voteError } = await supabaseAdmin
        .from('votes')
        .insert({ userId, commentId });
        
      if (voteError) {
        console.error('Comment vote error:', voteError);
        return res.status(500).json({ message: 'Failed to add vote' });
      }
      
      // Increment comment upvotes
      await supabaseAdmin.rpc('increment_comment_upvotes', { comment_id: commentId });
      
      res.json({ message: 'Vote added successfully' });
    } catch (error: any) {
      console.error('Comment vote error:', error);
      res.status(500).json({ message: 'Failed to add vote' });
    }
  });

  app.delete('/api/comments/:commentId/vote', requireAuth, async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const userId = req.session.userId!;
      
      // Remove vote
      const { error: voteError } = await supabaseAdmin
        .from('votes')
        .delete()
        .eq('userId', userId)
        .eq('commentId', commentId);
        
      if (voteError) {
        console.error('Comment unvote error:', voteError);
        return res.status(500).json({ message: 'Failed to remove vote' });
      }
      
      // Decrement comment upvotes
      await supabaseAdmin.rpc('decrement_comment_upvotes', { comment_id: commentId });
      
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
      
      const { data: notifications, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
        
      if (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({ message: 'Failed to get notifications' });
      }
      
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Failed to get notifications' });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await supabaseAdmin
        .from('notifications')
        .update({ isRead: true })
        .eq('id', id);
        
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  app.post('/api/notifications/mark-all-read', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      await supabaseAdmin
        .from('notifications')
        .update({ isRead: true })
        .eq('userId', userId)
        .eq('isRead', false);
        
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}