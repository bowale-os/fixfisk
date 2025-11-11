import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, check, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  is_sga_admin: boolean("is_sga_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("magic_link_tokens_email_idx").on(table.email),
  tokenIdx: index("magic_link_tokens_token_idx").on(table.token),
}));

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: text("status").notNull().default("pending"),
  sgaResponse: text("sga_response"),
  upvoteCount: integer("upvote_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  statusCheck: check("status_check", sql`${table.status} IN ('pending', 'reviewing', 'in_progress', 'completed', 'wont_fix')`),
  upvoteCountCheck: check("upvote_count_check", sql`${table.upvoteCount} >= 0`),
  commentCountCheck: check("comment_count_check", sql`${table.commentCount} >= 0`),
  userIdIdx: index("posts_user_id_idx").on(table.userId),
  createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
  statusIdx: index("posts_status_idx").on(table.status),
  tagsIdx: index("posts_tags_idx").using("gin", table.tags),
}));

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  upvoteCount: integer("upvote_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  upvoteCountCheck: check("comment_upvote_count_check", sql`${table.upvoteCount} >= 0`),
  postIdIdx: index("comments_post_id_idx").on(table.postId),
  createdAtIdx: index("comments_created_at_idx").on(table.createdAt),
}));

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: varchar("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  exactlyOneTargetCheck: check("exactly_one_target", sql`(${table.postId} IS NOT NULL AND ${table.commentId} IS NULL) OR (${table.postId} IS NULL AND ${table.commentId} IS NOT NULL)`),
  uniquePostVote: uniqueIndex("unique_post_vote").on(table.userId, table.postId).where(sql`${table.commentId} IS NULL`),
  uniqueCommentVote: uniqueIndex("unique_comment_vote").on(table.userId, table.commentId).where(sql`${table.postId} IS NULL`),
}));

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: varchar("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  typeCheck: check("type_check", sql`${table.type} IN ('status_update', 'comment', 'milestone')`),
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  upvoteCount: true,
  commentCount: true,
  createdAt: true,
}).extend({
  tags: z.array(z.string()),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  upvoteCount: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
}).refine(
  (data) => (data.postId && !data.commentId) || (!data.postId && data.commentId),
  { message: "Must vote on exactly one: post or comment" }
);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertMagicLinkTokenSchema = createInsertSchema(magicLinkTokens).omit({
  id: true,
  createdAt: true,
});

export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
export type InsertMagicLinkToken = z.infer<typeof insertMagicLinkTokenSchema>;

export const updatePostStatusSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'in_progress', 'completed', 'wont_fix']),
  sgaResponse: z.string().optional(),
});

export type UpdatePostStatus = z.infer<typeof updatePostStatusSchema>;
