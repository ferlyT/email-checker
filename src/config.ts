import "dotenv/config";

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const CONFIG = {
  EMAIL: {
    HOST: process.env.EMAIL_HOST || "imap.gmail.com",
    PORT: parseInt(process.env.EMAIL_PORT || "993"),
    SECURE: process.env.EMAIL_SECURE !== "false",
    USER: required("EMAIL_USER"),
    PASS: required("EMAIL_PASS"),
  },
  DATABASE_URL: required("DATABASE_URL"),
  TELEGRAM: {
    TOKEN: required("TELEGRAM_BOT_TOKEN"),
    CHAT_ID: required("TELEGRAM_CHAT_ID"),
  },
  POLL_INTERVAL: parseInt(process.env.POLL_INTERVAL_MS || "300000"),
};
