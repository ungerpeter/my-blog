import { Hono } from "hono";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";
import { PrismaBlogPostRepository } from "./repository";
import { BlogPost, CreateBlogPost, CreateBlogPostSchema, UpdateBlogPostSchema } from "./schema";

export type BlogPostsBindings = {
  DB: D1Database;
};

const api = new Hono<{ Bindings: BlogPostsBindings }>();
api.use("/posts/*", cors());

api.get("/posts", async (c) => {
  const repo = new PrismaBlogPostRepository(c.env.DB);
  const posts = await repo.allBlogPosts();
  return c.json({ posts: posts, ok: true });
});

api.post("/posts", async (c) => {
  const reqBody = await c.req.json();
  const dataParsed = CreateBlogPostSchema.safeParse(reqBody);
  if (!dataParsed.success) {
    return c.json({ error: dataParsed.error, ok: false }, 422);
  }
  const repo = new PrismaBlogPostRepository(c.env.DB);
  const newPost = await repo.createBlogPost(dataParsed.data).catch((e) => {
    console.error(e);
    return null;
  });
  if (!newPost) {
    return c.json({ error: "Can not create new post", ok: false }, 422);
  }
  return c.json({ post: newPost, ok: true }, 201);
});

api.get("/posts/:slug_or_id", async (c) => {
  const repo = new PrismaBlogPostRepository(c.env.DB);
  let post: BlogPost | null = null;
  const id = parseInt(c.req.param("slug_or_id"));
  if (isNaN(id)) {
    post = await repo.findBlogPostBySlug(c.req.param("slug_or_id"));
  } else {
    post = await repo.findBlogPost(id);
  }
  
  if (!post) {
    return c.json({ error: "Not Found", ok: false }, 404);
  }
  return c.json({ post: post, ok: true });
});

api.put("/posts/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const reqBody = await c.req.json();
  if (!reqBody.id) {
    reqBody.id = id;
  }
  const dataParsed = UpdateBlogPostSchema.safeParse(reqBody);
  if (!dataParsed.success) {
    return c.json({ error: dataParsed.error, ok: false }, 422);
  }
  const repo = new PrismaBlogPostRepository(c.env.DB);
  const post = await repo.updateBlogPost({ ...dataParsed.data, id });
  if (!post) {
    return c.json({ error: "Not Found", ok: false }, 404);
  }
  return c.json({ post: post, ok: true });
});

api.delete("/posts/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const repo = new PrismaBlogPostRepository(c.env.DB);
  const success = await repo.deleteBlogPost(id);
  return c.json({ ok: success });
});

export default api;
