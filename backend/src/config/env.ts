import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_ACCESS_EXPIRES_IN: z.string(),

  JWT_REFRESH_EXPIRES_IN: z.string(),

  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(15),

  CLIENT_URL: z
    .string()
    .min(1)
    .refine(
      (val) => {
        const urls = val.split(",").map((url) => url.trim());
        return urls.every((url) => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        });
      },
      { message: "CLIENT_URL must be a valid URL or a comma-separated list of valid URLs" }
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n", parsed.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = parsed.data;
