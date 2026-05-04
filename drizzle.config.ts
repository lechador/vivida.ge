import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Mirror Next.js precedence: .env.local overrides .env
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (checked .env.local and .env)");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
