import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { Bindings } from "./bindings";
import blogPostsApi from "./blog-posts/api";
import authorsApi from "./authors/api";

export interface Env {
  DB: D1Database
}

const app = new Hono();
app.get("/", (c) => c.text("Peters Blog API"));
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

const middleware = new Hono<{ Bindings: Bindings }>();
middleware.use("*", prettyJSON());

app.route("/api", middleware);
app.route("/api", blogPostsApi);
app.route("/api", authorsApi);

export default app;
