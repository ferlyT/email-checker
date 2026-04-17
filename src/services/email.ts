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
      logger: false
    });

    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    
    const subjects: string[] = [];

    try {
      // 1. Search for unseen messages from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const uids = await client.search({ 
        seen: false,
        since: today
      });
      
      console.log(`[EmailService] Found ${uids.length} unread UIDs from today:`, uids);
      
      if (uids.length === 0) return [];

      // 2. Fetch envelopes for these UIDs (all at once)
      for await (let message of client.fetch(uids, { envelope: true })) {
        if (message.envelope && message.envelope.subject) {
          const subject = message.envelope.subject;
          const from = message.envelope.from?.[0];
          const sender = from ? `${from.name || ""} <${from.address}>` : "Unknown Sender";
          
          console.log(`[EmailService] Reading email: "${subject}" from ${sender}`);
          subjects.push(subject);
        }
      }

      // 3. Mark all fetched messages as seen (done outside the loop to prevent deadlock)
      await client.messageFlagsAdd(uids, ['\\Seen']);
    } finally {
      lock.release();
    }

    await client.logout();
    return subjects;
  }
}
