import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  EMAIL_HOST: z.string().default("imap.gmail.com"),
  EMAIL_PORT: z.string().transform(Number).default("993"),
  EMAIL_SECURE: z.string().transform(v => v !== "false").default("true"),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  POLL_INTERVAL_MS: z.string().transform(Number).default("300000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const env = envSchema.parse(process.env);

export const CONFIG = {
  EMAIL: {
    HOST: env.EMAIL_HOST,
    PORT: env.EMAIL_PORT,
    SECURE: env.EMAIL_SECURE,
    USER: env.EMAIL_USER,
    PASS: env.EMAIL_PASS,
  },
  DATABASE_URL: env.DATABASE_URL,
  TELEGRAM: {
    TOKEN: env.TELEGRAM_BOT_TOKEN,
    CHAT_ID: env.TELEGRAM_CHAT_ID,
  },
  POLL_INTERVAL: env.POLL_INTERVAL_MS,
  NODE_ENV: env.NODE_ENV,
};
