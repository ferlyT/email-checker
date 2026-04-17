import { CONFIG } from "./config";
import { EmailService } from "./services/email";
import { ParserService } from "./services/parser";
import { DatabaseService } from "./services/database";
import { TelegramService } from "./services/telegram";
import { createDbConnection } from "./db";

async function main() {
  console.log("🚀 Starting Email Checker Service...");

  try {
    // 1. Initialize Services
    const db = await createDbConnection(CONFIG.DATABASE_URL);
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
      console.log(`[${new Date().toISOString()}] Checking for new emails...`);
      
      try {
        const subjects = await emailService.getNewEmailSubjects();
        console.log(`[Email] Found ${subjects.length} new messages.`);

        for (const subject of subjects) {
          const containerNumbers = ParserService.parseContainerNumbers(subject);
          
          if (containerNumbers.length > 0) {
            console.log(`[Parser] Found containers: ${containerNumbers.join(", ")}`);
            
            for (const no of containerNumbers) {
              const { found, status } = await dbService.checkContainerStatus(no);
              await telegramService.sendNotification(no, status);
            }
          }
        }
      } catch (error: any) {
        console.error("[Pipeline Error]", error.message);
        await telegramService.sendError(error.message);
      }
    };

    // 3. Start Polling
    await runPipeline(); // Run once immediately
    setInterval(runPipeline, CONFIG.POLL_INTERVAL);

  } catch (criticalError: any) {
    console.error("❌ Critical Service Error:", criticalError.message);
    process.exit(1);
  }
}

main();
