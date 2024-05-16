import { z } from "zod";
import { BlogPostSchema } from "../blog-posts";

export const AuthorSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  email: z.string(),
  avatarImageUrl: z.string().nullable(),
  blogPosts: z.array(BlogPostSchema).optional(),
});

export const CreateAuthorSchema = z.object({
  name: z.string(),
  email: z.string(),
  avatarImageUrl: z.string().nullable(),
});

export const UpdateAuthorSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  email: z.string().optional(),
  avatarImageUrl: z.string().nullable().optional(),
});

export type Author = z.infer<typeof AuthorSchema>;
export type CreateAuthor = z.infer<typeof CreateAuthorSchema>;
export type UpdateAuthor = z.infer<typeof UpdateAuthorSchema>;
