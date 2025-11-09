import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, check, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  isSGAAdmin: boolean("is_sga_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  uniquePostVoteIdx: index("unique_post_vote_idx").on(table.userId, table.postId).where(sql`${table.commentId} IS NULL`),
  uniqueCommentVoteIdx: index("unique_comment_vote_idx").on(table.userId, table.commentId).where(sql`${table.postId} IS NULL`),
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
