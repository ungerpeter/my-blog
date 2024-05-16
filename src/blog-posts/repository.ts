import { PrismaClient, BlogPost as PrismaBlogPost } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import {
  BlogPost,
  BlogPostSchema,
  CreateBlogPost,
  UpdateBlogPost,
} from "./schema";
import { D1Database } from "@cloudflare/workers-types";

export interface BlogPostRepository {
  allBlogPosts(): Promise<BlogPost[]>;
  findBlogPost(id: number): Promise<BlogPost | null>;
  createBlogPost(blogPost: CreateBlogPost): Promise<BlogPost>;
  updateBlogPost(blogPost: UpdateBlogPost): Promise<BlogPost | null>;
  deleteBlogPost(id: number): Promise<boolean>;
}

export class PrismaBlogPostRepository implements BlogPostRepository {
  private prismaClient: PrismaClient;

  constructor(database: D1Database) {
    this.prismaClient = new PrismaClient({
      adapter: new PrismaD1(database),
    });
  }

  private parseFromDB(prismaBlogPost: PrismaBlogPost): BlogPost | null {
    const blogPostDB = {
      ...prismaBlogPost,
      tags: Array.isArray(prismaBlogPost.tags)
        ? prismaBlogPost.tags?.split(",")
        : [],
    };
    const blogPostDBParsed = BlogPostSchema.safeParse(blogPostDB);
    if (!blogPostDBParsed.success) {
      console.error(blogPostDBParsed.error);
      console.error(blogPostDBParsed.error.issues);
      return null;
    }
    return blogPostDBParsed.data;
  }

  async allBlogPosts(): Promise<BlogPost[]> {
    const blogPostsDB = await this.prismaClient.blogPost.findMany();
    const blogPosts = blogPostsDB
      .map((blogPostDB) => this.parseFromDB(blogPostDB))
      .filter((blogPost) => blogPost !== null) as BlogPost[];
    return blogPosts;
  }

  async findBlogPost(id: number): Promise<BlogPost | null> {
    return this.prismaClient.blogPost
      .findFirst({ where: { id } })
      .then((prismaBlogPost) => {
        if (!prismaBlogPost) {
          return null;
        }
        return this.parseFromDB(prismaBlogPost);
      });
  }

  async createBlogPost(blogPost: CreateBlogPost): Promise<BlogPost> {
    const data = { ...blogPost, tags: blogPost.tags?.join(",") };
    console.info("creating blog post with data:");
    console.dir(data);
    return this.prismaClient.blogPost
      .create({ data })
      .then((prismaBlogPost) => {
        const blogPost = this.parseFromDB(prismaBlogPost);
        if (!blogPost) {
          throw new Error("Failed to create blog post");
        }
        return blogPost;
      });
  }

  async updateBlogPost(blogPost: UpdateBlogPost): Promise<BlogPost | null> {
    const data = {
      ...blogPost,
      tags: Array.isArray(blogPost.tags) ? blogPost.tags.join(",") : null,
    };
    return this.prismaClient.blogPost
      .update({
        where: { id: blogPost.id },
        data: data,
      })
      .then((prismaBlogPost) => {
        const blogPost = this.parseFromDB(prismaBlogPost);
        if (!blogPost) {
          throw new Error("Failed to update blog post");
        }
        return blogPost;
      });
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.prismaClient.blogPost.delete({ where: { id } }).then(() => {
      return true;
    });
  }
}
