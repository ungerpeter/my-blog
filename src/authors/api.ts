import { Hono } from "hono";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";
import { PrismaAuthorRepository } from "./repository";
import { CreateAuthorSchema, UpdateAuthorSchema } from "./schema";

export type AuthorsBindings = {
  DB: D1Database;
};

const api = new Hono<{ Bindings: AuthorsBindings }>();
api.use("/authors/*", cors());

api.get("/authors", async (c) => {
  const repo = new PrismaAuthorRepository(c.env.DB);
  const authors = await repo.allAuthors();
  return c.json({ authors: authors, ok: true });
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
    return c.json({ error: "Can not create new author", ok: false }, 422);
  }
  return c.json({ author: newAuthor, ok: true }, 201);
});

api.get("/authors/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const repo = new PrismaAuthorRepository(c.env.DB);
  const author = await repo.findAuthor(id);
  if (!author) {
    return c.json({ error: "Not Found", ok: false }, 404);
  }
  return c.json({ author: author, ok: true });
});

api.put("/authors/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const reqBody = await c.req.json();
  if (!reqBody.id) {
    reqBody.id = id;
  }
  const dataParsed = UpdateAuthorSchema.safeParse(reqBody);
  if (!dataParsed.success) {
    return c.json({ error: dataParsed.error, ok: false }, 422);
  }
  const repo = new PrismaAuthorRepository(c.env.DB);
  const author = await repo.updateAuthor({ ...dataParsed.data, id });
  if (!author) {
    return c.json({ error: "Not Found", ok: false }, 404);
  }
  return c.json({ author: author, ok: true });
});

api.delete("/authors/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const repo = new PrismaAuthorRepository(c.env.DB);
  const success = await repo.deleteAuthor(id);
  return c.json({ ok: success });
});

export default api;
