import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  JWT_EXPIRES_IN: z.string().default("2h"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Konfigurasi environment tidak valid:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

