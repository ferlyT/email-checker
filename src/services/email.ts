import { ImapFlow } from 'imapflow';
import { logger } from '../utils/logger';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async getNewEmailSubjects(): Promise<string[]> {
    const client = new ImapFlow({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
      logger: false,
      tls: {
        rejectUnauthorized: false
      },
      // Increase timeout for reliability
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    // Listen for client errors
    client.on('error', err => {
      logger.error({ err }, "[ImapFlow Client Error] %s", err.message);
    });

    try {
      await client.connect();
      logger.debug("[EmailService] Connected to IMAP server");

      const lock = await client.getMailboxLock('INBOX');
      const subjects: string[] = [];

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const uids = await client.search({ 
          seen: false,
          since: today
        });
        
        logger.debug("[EmailService] Found %d unread UIDs from today", uids.length);
        
        if (uids.length === 0) return [];

        for await (let message of client.fetch(uids, { envelope: true })) {
          if (message.envelope && message.envelope.subject) {
            const subject = message.envelope.subject;
            const from = message.envelope.from?.[0];
            const sender = from ? `${from.name || ""} <${from.address}>` : "Unknown Sender";
            
            logger.info("[EmailService] Reading email: \"%s\" from %s", subject, sender);
            subjects.push(subject);
          }
        }

        await client.messageFlagsAdd(uids, ['\\Seen']);
      } finally {
        lock.release();
      }

      await client.logout();
      return subjects;
    } catch (error: any) {
      logger.error({ err: error }, "[EmailService Error] %s", error.message);
      throw error;
    }
  }
}
