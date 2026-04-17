import { Telegraf } from 'telegraf';

export class TelegramService {
  private bot: Telegraf;
  private chatId: string;

  constructor(token: string, chatId: string) {
    this.bot = new Telegraf(token);
    this.chatId = chatId;
  }

  async sendNotification(containerNo: string, markingCode: string, details: string, subject: string) {
    const message = `📦 *New Email Received*\n\n*Title:* ${subject}\n*Number:* \`${containerNo}\`\n*Marking Code:* *${markingCode}*\n\n${details}`;

    try {
      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
      });
      console.log(`[Telegram] Sent notification for ${containerNo}`);
    } catch (error) {
      console.error('[Telegram] Error sending notification:', error);
    }
  }

  async sendError(errorMsg: string) {
    try {
      await this.bot.telegram.sendMessage(this.chatId, `⚠️ *Email Checker Error*\n\n${errorMsg}`, {
        parse_mode: 'Markdown',
      });
    } catch (err) {
      console.error('[Telegram] Failed to send error message:', err);
    }
  }
}
