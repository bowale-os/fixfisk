import { db } from "./db";
import { users, posts, comments, votes, notifications, magicLinkTokens } from "@shared/schema";
import type { 
  User, InsertUser,
  Post, InsertPost,
  Comment, InsertComment,
  Vote, InsertVote,
  Notification, InsertNotification,
  MagicLinkToken, InsertMagicLinkToken
} from "@shared/schema";
import { eq, desc, and, sql, isNull, inArray, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Magic Link Tokens
  createMagicLinkToken(token: InsertMagicLinkToken): Promise<MagicLinkToken>;
  getMagicLinkToken(token: string): Promise<MagicLinkToken | undefined>;
  deleteMagicLinkToken(token: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
  
  // Posts
  getPost(id: string): Promise<Post | undefined>;
  getPosts(options?: { tags?: string[]; status?: string; sortBy?: string; limit?: number }): Promise<(Post & { authorEmail?: string })[]>;
  getPostsByUser(userId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  
  // Comments
  getCommentsByPost(postId: string): Promise<Comment[]>;
  
  // Votes
  getVote(userId: string, postId?: string, commentId?: string): Promise<Vote | undefined>;
  
  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  
  // Transactional operations
  addVoteToPost(userId: string, postId: string): Promise<Vote>;
  removeVoteFromPost(userId: string, postId: string): Promise<void>;
  addVoteToComment(userId: string, commentId: string): Promise<Vote>;
  removeVoteFromComment(userId: string, commentId: string): Promise<void>;
  addCommentToPost(comment: InsertComment): Promise<Comment>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Magic Link Tokens
  async createMagicLinkToken(insertToken: InsertMagicLinkToken): Promise<MagicLinkToken> {
    const result = await db.insert(magicLinkTokens).values(insertToken).returning();
    return result[0];
  }

  async getMagicLinkToken(token: string): Promise<MagicLinkToken | undefined> {
    const result = await db.select().from(magicLinkTokens).where(eq(magicLinkTokens.token, token)).limit(1);
    return result[0];
  }

  async deleteMagicLinkToken(token: string): Promise<void> {
    await db.delete(magicLinkTokens).where(eq(magicLinkTokens.token, token));
  }

  async deleteExpiredTokens(): Promise<void> {
    await db.delete(magicLinkTokens).where(lt(magicLinkTokens.expiresAt, new Date()));
  }

  // Posts
  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPosts(options?: { tags?: string[]; status?: string; sortBy?: string; limit?: number }): Promise<(Post & { authorEmail?: string })[]> {
    let query = db
      .select({
        post: posts,
        authorEmail: users.email,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id));
    
    const conditions = [];
    
    if (options?.tags && options.tags.length > 0) {
      conditions.push(sql`${posts.tags} && ARRAY[${sql.join(options.tags.map(tag => sql`${tag}`), sql`, `)}]::text[]`);
    }
    
    if (options?.status) {
      conditions.push(eq(posts.status, options.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    // Sorting
    if (options?.sortBy === 'recent') {
      query = query.orderBy(desc(posts.createdAt)) as any;
    } else if (options?.sortBy === 'upvotes') {
      query = query.orderBy(desc(posts.upvoteCount)) as any;
    } else {
      // Trending: weighted score favoring newer posts with upvotes
      // Score = upvotes / ((hours_since_creation + 2) ^ 1.5)
      query = query.orderBy(desc(sql`${posts.upvoteCount}::float / POWER((EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600) + 2, 1.5)`)) as any;
    }
    
    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    
    const results = await query;
    
    return results.map(({ post, authorEmail }) => ({
      ...post,
      authorEmail: post.isAnonymous ? undefined : authorEmail || undefined,
    }));
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(insertPost).returning();
    return result[0];
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const result = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
    return result[0];
  }

  // Comments
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  // Votes
  async getVote(userId: string, postId?: string, commentId?: string): Promise<Vote | undefined> {
    if (postId) {
      const result = await db.select().from(votes)
        .where(and(eq(votes.userId, userId), eq(votes.postId, postId), isNull(votes.commentId)))
        .limit(1);
      return result[0];
    } else if (commentId) {
      const result = await db.select().from(votes)
        .where(and(eq(votes.userId, userId), eq(votes.commentId, commentId), isNull(votes.postId)))
        .limit(1);
      return result[0];
    }
    return undefined;
  }

  // Notifications
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  // Transactional operations
  async addVoteToPost(userId: string, postId: string): Promise<Vote> {
    return await db.transaction(async (tx) => {
      // Insert vote
      const [vote] = await tx.insert(votes).values({ userId, postId }).returning();
      
      // Increment post upvote count
      await tx.update(posts)
        .set({ upvoteCount: sql`${posts.upvoteCount} + 1` })
        .where(eq(posts.id, postId));
      
      return vote;
    });
  }

  async removeVoteFromPost(userId: string, postId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete vote and check if it existed
      const deletedVotes = await tx.delete(votes)
        .where(and(eq(votes.userId, userId), eq(votes.postId, postId), isNull(votes.commentId)))
        .returning();
      
      // Only decrement if a vote was actually deleted
      if (deletedVotes.length > 0) {
        await tx.update(posts)
          .set({ upvoteCount: sql`${posts.upvoteCount} - 1` })
          .where(eq(posts.id, postId));
      }
    });
  }

  async addVoteToComment(userId: string, commentId: string): Promise<Vote> {
    return await db.transaction(async (tx) => {
      // Insert vote
      const [vote] = await tx.insert(votes).values({ userId, commentId }).returning();
      
      // Increment comment upvote count
      await tx.update(comments)
        .set({ upvoteCount: sql`${comments.upvoteCount} + 1` })
        .where(eq(comments.id, commentId));
      
      return vote;
    });
  }

  async removeVoteFromComment(userId: string, commentId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete vote and check if it existed
      const deletedVotes = await tx.delete(votes)
        .where(and(eq(votes.userId, userId), eq(votes.commentId, commentId), isNull(votes.postId)))
        .returning();
      
      // Only decrement if a vote was actually deleted
      if (deletedVotes.length > 0) {
        await tx.update(comments)
          .set({ upvoteCount: sql`${comments.upvoteCount} - 1` })
          .where(eq(comments.id, commentId));
      }
    });
  }

  async addCommentToPost(insertComment: InsertComment): Promise<Comment> {
    return await db.transaction(async (tx) => {
      // Insert comment
      const [comment] = await tx.insert(comments).values(insertComment).returning();
      
      // Increment post comment count
      await tx.update(posts)
        .set({ commentCount: sql`${posts.commentCount} + 1` })
        .where(eq(posts.id, insertComment.postId));
      
      return comment;
    });
  }
}

export const storage = new DbStorage();
