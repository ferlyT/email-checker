import { ImapFlow } from 'imapflow';
import { CONFIG } from '../src/config';

async function test() {
  const client = new ImapFlow({
    host: CONFIG.EMAIL.HOST,
    port: CONFIG.EMAIL.PORT,
    secure: CONFIG.EMAIL.SECURE,
    auth: {
      user: CONFIG.EMAIL.USER,
      pass: CONFIG.EMAIL.PASS,
    },
    logger: false
  });

  try {
    await client.connect();
    console.log('Connected');
    const lock = await client.getMailboxLock('INBOX');
    try {
      console.log('Searching...');
      // search returns an array of UIDs
      const uids = await client.search({ seen: false });
      console.log('Found UIDs:', uids);
      
      for (const uid of uids) {
        console.log('Fetching UID:', uid);
        const messages = client.fetch(uid, { envelope: true });
        for await (let msg of messages) {
          console.log('Subject:', msg.envelope.subject);
        }
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
