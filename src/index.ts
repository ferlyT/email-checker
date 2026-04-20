import { CONFIG } from "./config";
import { EmailService } from "./services/email";
import { ParserService } from "./services/parser";
import { DatabaseService } from "./services/database";
import { TelegramService } from "./services/telegram";
import { createDbConnection } from "./db";
import { logger } from "./utils/logger";

async function main() {
  logger.info("🚀 Starting Email Checker Service in %s mode...", CONFIG.NODE_ENV);

  let db: any;
  let isRunning = true;

  // Graceful Shutdown Handler
  const shutdown = async (signal: string) => {
    if (!isRunning) return;
    isRunning = false;
    logger.info("🛑 Received %s. Shutting down gracefully...", signal);
    
    try {
      if (db) await db.close();
      logger.info("📦 Database connection closed.");
    } catch (err: any) {
      logger.error("❌ Error during shutdown: %s", err.message);
    }
    
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    // 1. Initialize Services
    db = await createDbConnection(CONFIG.DATABASE_URL);
    const dbService = new DatabaseService(db);
    
    const emailService = new EmailService({
      host: CONFIG.EMAIL.HOST,
      port: CONFIG.EMAIL.PORT,
      secure: CONFIG.EMAIL.SECURE,
      auth: {
        user: CONFIG.EMAIL.USER,
        pass: CONFIG.EMAIL.PASS,
      },
    });

    const telegramService = new TelegramService(
      CONFIG.TELEGRAM.TOKEN,
      CONFIG.TELEGRAM.CHAT_ID
    );

    // 2. Define the Pipeline
    const runPipeline = async () => {
      logger.info("Checking for new emails...");
      
      try {
        const subjects = await emailService.getNewEmailSubjects();
        logger.info("Found %d new messages.", subjects.length);

        for (const subject of subjects) {
          const containerNumbers = ParserService.parseContainerNumbers(subject);
          
          if (containerNumbers.length > 0) {
            logger.info("[Parser] Found containers: %s", containerNumbers.join(", "));
            
            for (const no of containerNumbers) {
              const { found, markingCode, details } = await dbService.checkContainerStatus(no);
              await telegramService.sendNotification(no, markingCode, details, subject);
            }
          }
        }
      } catch (error: any) {
        logger.error("[Pipeline Error] %s", error.message);
        await telegramService.sendError(error.message);
      }
    };

    // 3. Start Polling
    while (isRunning) {
      await runPipeline();
      
      logger.info("Next check in %ds...", CONFIG.POLL_INTERVAL / 1000);
      
      // Wait for interval but allow interruption
      const waitTime = CONFIG.POLL_INTERVAL;
      const startTime = Date.now();
      
      while (Date.now() - startTime < waitTime && isRunning) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (criticalError: any) {
    logger.error("❌ Critical Initialization Error: %s", criticalError.message);
    if (isRunning) {
      logger.info("Retrying initialization in 30 seconds...");
      setTimeout(main, 30000);
    }
  }
}

main();
