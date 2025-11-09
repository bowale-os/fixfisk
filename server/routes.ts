import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomBytes } from "crypto";
import { z } from "zod";

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
      
      // Clean up expired tokens
      await storage.deleteExpiredTokens();
      
      // Generate magic link token (valid for 15 minutes)
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      await storage.createMagicLinkToken({
        email: normalizedEmail,
        token,
        expiresAt,
      });
      
      // In development, log the magic link
      // In production, send via email service (SendGrid/Resend)
      const magicLink = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${token}`;
      console.log('\n🔗 Magic Link for', normalizedEmail, ':\n', magicLink, '\n');
      
      res.json({ 
        message: 'Magic link sent! Check your email.',
        ...(process.env.NODE_ENV === 'development' && { magicLink }) // Include link in dev
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Magic link error:', error);
      res.status(500).json({ message: 'Failed to send magic link' });
    }
  });

  app.get('/api/auth/verify', async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Invalid token' });
      }
      
      const magicToken = await storage.getMagicLinkToken(token);
      
      if (!magicToken) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      
      if (new Date() > magicToken.expiresAt) {
        await storage.deleteMagicLinkToken(token);
        return res.status(400).json({ message: 'Token expired' });
      }
      
      // Find or create user
      let user = await storage.getUserByEmail(magicToken.email);
      if (!user) {
        user = await storage.createUser({ email: magicToken.email });
      }
      
      // Delete used token
      await storage.deleteMagicLinkToken(token);
      
      // Create session
      req.session.userId = user.id;
      
      res.json({ 
        message: 'Authentication successful',
        user: {
          id: user.id,
          email: user.email,
          isSGAAdmin: user.isSGAAdmin,
        }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ message: 'Authentication failed' });
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
      
      const posts = await storage.getPosts({
        tags: tags ? (typeof tags === 'string' ? [tags] : tags as string[]) : undefined,
        status: typeof status === 'string' ? status : undefined,
        sortBy: typeof sortBy === 'string' ? sortBy : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(posts);
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ message: 'Failed to get posts' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
