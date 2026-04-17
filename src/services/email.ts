import { ImapFlow } from 'imapflow';

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
  private client: ImapFlow;

  constructor(config: EmailConfig) {
    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      logger: false
    });
  }

  async getNewEmailSubjects(): Promise<string[]> {
    await this.client.connect();
    const lock = await this.client.getMailboxLock('INBOX');
    
    const subjects: string[] = [];

    try {
      // Search for unseen messages
      for await (let message of this.client.search({ seen: false })) {
        const envelope = message.envelope;
        if (envelope && envelope.subject) {
          subjects.push(envelope.subject);
          
          // Mark as seen
          await this.client.messageFlagsAdd(message.uid, ['\\Seen']);
        }
      }
    } finally {
      lock.release();
    }

    await this.client.logout();
    return subjects;
  }
}
