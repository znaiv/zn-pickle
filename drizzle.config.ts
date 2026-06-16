import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./pickle.db";
const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

const isTurso = url.startsWith("libsql://") || url.startsWith("libsql:");

export default defineConfig(
  isTurso
    ? {
        schema: "./db/schema.ts",
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: {
          url,
          authToken,
        },
      }
    : {
        schema: "./db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: {
          url,
        },
      },
);
