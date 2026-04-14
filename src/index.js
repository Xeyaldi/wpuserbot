// ============================================
//   XEYAL USERBOT v2.0
//   Developer: Xeyal
//   WhatsApp Userbot - Pairing Code Login
// ============================================

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  jidNormalizedUser
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const { messageHandler } = require('./handlers/messageHandler');
const { antiDeleteHandler } = require('./handlers/antiDeleteHandler');
const { welcomeHandler } = require('./handlers/groupHandler');
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const AUTH_FOLDER = path.join(__dirname, '../data/auth');
const SESSION_FOLDER = path.join(__dirname, '../data/session');

fs.ensureDirSync(AUTH_FOLDER);
fs.ensureDirSync(SESSION_FOLDER);

// Settings yüklə
const settingsPath = path.join(__dirname, '../data/settings.json');
if (!fs.existsSync(settingsPath)) {
  fs.writeJsonSync(settingsPath, {
    antiDelete: process.env.ANTI_DELETE === 'true',
    pmPermit: process.env.PM_PERMIT === 'true',
    autoRead: process.env.AUTO_READ === 'false',
    afkUsers: {},
    mutedGroups: []
  }, { spaces: 2 });
}

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(text, ans => { rl.close(); resolve(ans); }));
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: process.env.LOG_LEVEL || 'silent' });

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser: ['Xeyal Userbot', 'Chrome', '120.0.0'],
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return { conversation: 'Xeyal Userbot aktifdir.' };
    }
  });

  store?.bind(sock.ev);

  // ── Pairing Code Login ──────────────────────────────────────
  if (!sock.authState.creds.registered) {
    let phoneNumber = process.env.PHONE_NUMBER;
    if (!phoneNumber) {
      phoneNumber = await question('\n📱 WhatsApp nömrənizi daxil edin (ölkə kodu ilə, məsələn 994501234567): ');
    }
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    console.log('\n⏳ Pairing kodu alınır...');
    await new Promise(r => setTimeout(r, 3000));
    
    const code = await sock.requestPairingCode(phoneNumber);
    console.log('\n╔════════════════════════════════╗');
    console.log('║   XEYAL USERBOT - Pairing Kod  ║');
    console.log('╠════════════════════════════════╣');
    console.log(`║   Kodunuz:  ${code}       ║`);
    console.log('╠════════════════════════════════╣');
    console.log('║  WhatsApp > Bağlı cihazlar >   ║');
    console.log('║  Cihaz əlavə et > Telefon nöm. ║');
    console.log('╚════════════════════════════════╝\n');
  }

  // ── Connection Handler ──────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(`❌ Bağlantı kəsildi. Səbəb: ${reason}`);

      if (reason === DisconnectReason.badSession) {
        console.log('🗑 Sessiya silinir, yenidən başladılır...');
        fs.removeSync(AUTH_FOLDER);
        startBot();
      } else if (reason === DisconnectReason.connectionClosed ||
                 reason === DisconnectReason.connectionLost ||
                 reason === DisconnectReason.timedOut) {
        console.log('🔄 Yenidən qoşulunur...');
        startBot();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log('⚠️  Başqa cihazda açıldı. Bot dayandırıldı.');
        process.exit(1);
      } else if (reason === DisconnectReason.loggedOut) {
        console.log('🚪 Çıxış edildi. Yenidən giriş tələb olunur.');
        fs.removeSync(AUTH_FOLDER);
        startBot();
      } else {
        console.log('🔄 Naməlum xəta, yenidən başladılır...');
        startBot();
      }
    }

    if (connection === 'open') {
      const user = sock.user;
      console.log('\n╔══════════════════════════════════════╗');
      console.log('║        XEYAL USERBOT v2.0            ║');
      console.log('║        Developer: Xeyal              ║');
      console.log('╠══════════════════════════════════════╣');
      console.log(`║  ✅ Qoşuldu: ${user?.name || 'Xeyal'}`.padEnd(42) + '║');
      console.log(`║  📱 ${user?.id?.split(':')[0] || ''}`.padEnd(42) + '║');
      console.log('║  🤖 Bot hazırdır!                    ║');
      console.log('╚══════════════════════════════════════╝\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Message Handler ─────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      try {
        await messageHandler(sock, msg);
        await antiDeleteHandler(sock, msg, 'save');
      } catch (err) {
        console.error('❌ Mesaj xətası:', err.message);
      }
    }
  });

  // ── Anti-Delete ─────────────────────────────────────────────
  sock.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      try {
        await antiDeleteHandler(sock, update, 'delete');
      } catch (err) {}
    }
  });

  // ── Group Events ─────────────────────────────────────────────
  sock.ev.on('group-participants.update', async (update) => {
    try {
      await welcomeHandler(sock, update);
    } catch (err) {}
  });

  return sock;
}

console.log('\n🚀 XEYAL USERBOT başladılır...\n');
startBot().catch(err => {
  console.error('❌ Kritik xəta:', err);
  process.exit(1);
});
