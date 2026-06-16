import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "pickle.db")}`;

if (process.env.VERCEL === "1" && dbUrl.startsWith("file:")) {
  throw new Error(
    "Local SQLite cannot run on Vercel. Set DATABASE_URL to a Turso libsql:// URL and DATABASE_AUTH_TOKEN in Vercel project settings.",
  );
}

if (dbUrl.startsWith("file:")) {
  const filePath = dbUrl.replace(/^file:/, "");
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
