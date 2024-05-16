import { z } from "zod";

export const BlogPostSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable(),
  isPublished: z.boolean(),
  authorId: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  coverImageUrl: z.string().nullable(),
  summary: z.string().nullable(),
  tags: z.array(z.string()),
  readingTimeSeconds: z.number().nullable(),
  commentsEnabled: z.boolean(),
});

export const CreateBlogPostSchema = z.object({
  authorId: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  coverImageUrl: z.string().nullable(),
  summary: z.string().nullable(),
  tags: z.array(z.string()),
  commentsEnabled: z.boolean(),
});

export const UpdateBlogPostSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  commentsEnabled: z.boolean().optional(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;
export type CreateBlogPost = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof UpdateBlogPostSchema>;
