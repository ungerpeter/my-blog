import { Hono } from "hono";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";
import { PrismaBlogPostRepository } from "./repository";
import { CreateBlogPost, CreateBlogPostSchema } from "./schema";

export type BlogPostsBindings = {
  DB: D1Database;
};

const api = new Hono<{ Bindings: BlogPostsBindings }>();
api.use("/posts/*", cors());

api.get("/posts", async (c) => {
  const repo = new PrismaBlogPostRepository(c.env.DB);
  const posts = await repo.allBlogPosts();
  return c.json({ posts: posts });
});

api.post("/posts", async (c) => {
  const repo = new PrismaBlogPostRepository(c.env.DB);
  const reqBody = await c.req.json();
  const dataParsed = CreateBlogPostSchema.safeParse(reqBody);
  if (!dataParsed.success) {
    return c.json({ error: dataParsed.error, ok: false }, 422);
  }
  const newPost = await repo.createBlogPost(dataParsed.data).catch((e) => {
    console.error(e);
    return null;
  });
  if (!newPost) {
    return c.json({ error: "Can not create new post", ok: false }, 422);
  }
  return c.json({ post: newPost, ok: true }, 201);
});

// api.get("/posts/:id", async (c) => {
//   const id = c.req.param("id");
//   const post = await model.getPost(c.env.BLOG_EXAMPLE, id);
//   if (!post) {
//     return c.json({ error: "Not Found", ok: false }, 404);
//   }
//   return c.json({ post: post, ok: true });
// });

// api.put("/posts/:id", async (c) => {
//   const id = c.req.param("id");
//   const post = await model.getPost(c.env.BLOG_EXAMPLE, id);
//   if (!post) {
//     // 204 No Content
//     return new Response(null, { status: 204 });
//   }
//   const param = await c.req.json();
//   const success = await model.updatePost(
//     c.env.BLOG_EXAMPLE,
//     id,
//     param as model.Param
//   );
//   return c.json({ ok: success });
// });

// api.delete("/posts/:id", async (c) => {
//   const id = c.req.param("id");
//   const post = await model.getPost(c.env.BLOG_EXAMPLE, id);
//   if (!post) {
//     // 204 No Content
//     return new Response(null, { status: 204 });
//   }
//   const success = await model.deletePost(c.env.BLOG_EXAMPLE, id);
//   return c.json({ ok: success });
// });

export default api;
