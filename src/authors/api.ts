import { Hono } from "hono";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";
import { PrismaAuthorRepository } from "./repository";
import { CreateAuthorSchema } from "./schema";

export type AuthorsBindings = {
  DB: D1Database;
};

const api = new Hono<{ Bindings: AuthorsBindings }>();
api.use("/authors/*", cors());

api.get("/authors", async (c) => {
  const repo = new PrismaAuthorRepository(c.env.DB);
  const authors = await repo.allAuthors();
  return c.json({ authors: authors });
});

api.post("/authors", async (c) => {
  const repo = new PrismaAuthorRepository(c.env.DB);
  const reqBody = await c.req.json();
  const dataParsed = CreateAuthorSchema.safeParse(reqBody);
  if (!dataParsed.success) {
    return c.json({ error: dataParsed.error, ok: false }, 422);
  }
  const newAuthor = await repo.createAuthor(dataParsed.data).catch((e) => {
    console.error(e);
    return null;
  });
  if (!newAuthor) {
    return c.json({ error: "Can not create new post", ok: false }, 422);
  }
  return c.json({ author: newAuthor, ok: true }, 201);
});

export default api;
