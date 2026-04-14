// ============================================
//   Mesaj Handler - Bütün komutları idarə edir
//   Developer: Xeyal
// ============================================

const fs = require('fs-extra');
const path = require('path');

// Commands
const aiCmds = require('../commands/ai');
const utilCmds = require('../commands/utils');
const groupCmds = require('../commands/group');
const funCmds = require('../commands/fun');
const mediaCmds = require('../commands/media');
const infoCmds = require('../commands/info');

const settingsPath = path.join(__dirname, '../../data/settings.json');
const PREFIX = process.env.PREFIX || '.';

function getSettings() {
  return fs.readJsonSync(settingsPath, { throws: false }) || {};
}

function getMsgText(msg) {
  const m = msg.message;
  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    m?.documentMessage?.caption ||
    ''
  );
}

function getMsgType(msg) {
  const m = msg.message;
  if (!m) return null;
  const keys = Object.keys(m);
  if (keys.includes('stickerMessage')) return 'sticker';
  if (keys.includes('imageMessage')) return 'image';
  if (keys.includes('videoMessage')) return 'video';
  if (keys.includes('audioMessage')) return 'audio';
  if (keys.includes('documentMessage')) return 'document';
  if (keys.includes('conversation') || keys.includes('extendedTextMessage')) return 'text';
  return keys[0] || 'unknown';
}

async function messageHandler(sock, msg) {
  const settings = getSettings();
  const jid = msg.key.remoteJid;
  const isGroup = jid?.endsWith('@g.us');
  const isMe = msg.key.fromMe;
  const sender = isGroup ? msg.key.participant : jid;
  const pushName = msg.pushName || 'İstifadəçi';
  const msgType = getMsgType(msg);
  const text = getMsgText(msg);
  const isCmd = text.startsWith(PREFIX);

  // Auto Read
  if (settings.autoRead && !isMe) {
    await sock.readMessages([msg.key]);
  }

  // PM Permit
  if (settings.pmPermit && !isGroup && !isMe && sender !== sock.user.id.split(':')[0] + '@s.whatsapp.net') {
    await sock.sendMessage(jid, {
      text: `⚠️ Salam! Bu hesab şəxsi mesajlara qapalıdır.\n\nZəhmət olmasa əvvəlcə icazə alın.`
    });
    return;
  }

  // AFK Check - gələn mesajda AFK istifadəçini mention et
  if (!isMe && isGroup) {
    const afkUsers = settings.afkUsers || {};
    const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    for (const mJid of mentionedJids) {
      const cleanJid = mJid.split('@')[0];
      if (afkUsers[cleanJid]) {
        const afkData = afkUsers[cleanJid];
        const timeDiff = Math.floor((Date.now() - afkData.time) / 60000);
        await sock.sendMessage(jid, {
          text: `😴 *${afkData.name}* hal-hazırda AFK-dadır!\n📝 Səbəb: ${afkData.reason}\n⏱ ${timeDiff} dəqiqədir AFK-dadır`
        }, { quoted: msg });
      }
    }
  }

  // AFK geri dönüş - öz mesajını yazan AFK-dan çıxır
  if (isMe && text) {
    const settings2 = getSettings();
    const myNum = sock.user.id.split(':')[0];
    if (settings2.afkUsers && settings2.afkUsers[myNum]) {
      delete settings2.afkUsers[myNum];
      fs.writeJsonSync(settingsPath, settings2, { spaces: 2 });
      await sock.sendMessage(jid, { text: '✅ AFK rejimindən çıxdınız!' }, { quoted: msg });
    }
  }

  // Yalnız öz mesajlarına komut işlə (userbot)
  if (!isMe) return;
  if (!isCmd) return;

  const args = text.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = args[0]?.toLowerCase();
  const query = args.slice(1).join(' ');

  const ctx = { sock, msg, jid, isGroup, sender, pushName, msgType, text, args, cmd, query, settings, settingsPath, PREFIX };

  // ── Komut Router ─────────────────────────────────────
  try {
    switch (cmd) {
      // Info & System
      case 'komek':
      case 'help':
        return await infoCmds.help(ctx);
      case 'ping':
        return await infoCmds.ping(ctx);
      case 'vaxt':
        return await infoCmds.time(ctx);
      case 'info':
        return await infoCmds.botInfo(ctx);
      case 'id':
        return await infoCmds.getId(ctx);
      case 'qrupinfo':
        return await infoCmds.groupInfo(ctx);
      case 'sistem':
        return await infoCmds.system(ctx);
      case 'tertibatci':
      case 'developer':
        return await infoCmds.developer(ctx);
      case 'restart':
        return await infoCmds.restart(ctx);

      // AI
      case 'ai':
      case 'gpt':
        return await aiCmds.chat(ctx);
      case 'analiz':
        return await aiCmds.analyze(ctx);
      case 'kod':
        return await aiCmds.code(ctx);

      // Utils
      case 'hava':
        return await utilCmds.weather(ctx);
      case 'cevir':
        return await utilCmds.translate(ctx);
      case 'qr':
        return await utilCmds.qrCode(ctx);
      case 'hesabla':
        return await utilCmds.calculate(ctx);
      case 'şifrə':
      case 'sifre':
        return await utilCmds.password(ctx);
      case 'coinçevir':
      case 'coincevir':
        return await utilCmds.crypto(ctx);
      case 'valyuta':
        return await utilCmds.currency(ctx);
      case 'ip':
        return await utilCmds.ipLookup(ctx);
      case 'kısalt':
      case 'kisalt':
        return await utilCmds.shortenUrl(ctx);
      case 'ocr':
        return await mediaCmds.ocr(ctx);
      case 'ud':
        return await utilCmds.urbanDict(ctx);
      case 'tiktok':
        return await mediaCmds.tiktok(ctx);

      // Media
      case 'stiker':
        return await mediaCmds.makeSticker(ctx);
      case 'stikertoimg':
        return await mediaCmds.stickerToImg(ctx);

      // Fun
      case 'zarafat':
        return await funCmds.joke(ctx);
      case 'atalar':
        return await funCmds.proverb(ctx);
      case 'sitatlar':
        return await funCmds.quote(ctx);
      case 'zər':
      case 'zer':
        return await funCmds.dice(ctx);
      case 'seç':
      case 'sec':
        return await funCmds.choose(ctx);

      // AFK
      case 'afk':
        return await utilCmds.setAfk(ctx);
      case 'geri':
        return await utilCmds.removeAfk(ctx);

      // Group
      case 'qruplink':
        return await groupCmds.getLink(ctx);
      case 'qrupad':
        return await groupCmds.addMember(ctx);
      case 'qrupçıxar':
      case 'qrupcixar':
        return await groupCmds.removeMember(ctx);
      case 'mute':
        return await groupCmds.muteGroup(ctx);
      case 'unmute':
        return await groupCmds.unmuteGroup(ctx);
      case 'alqrup':
        return await groupCmds.getMemberList(ctx);
      case 'broadcast':
        return await groupCmds.broadcast(ctx);

      // Settings
      case 'antidelete':
        return await utilCmds.toggleAntiDelete(ctx);
      case 'pmpermit':
        return await utilCmds.togglePmPermit(ctx);
      case 'autookuma':
        return await utilCmds.toggleAutoRead(ctx);

      default:
        // Bilinməyən komut - susqun qal
        break;
    }
  } catch (err) {
    console.error(`❌ Komut xətası [${cmd}]:`, err.message);
    await sock.sendMessage(jid, {
      text: `❌ *Xəta baş verdi!*\n\`\`\`${err.message}\`\`\``
    }, { quoted: msg });
  }
}

module.exports = { messageHandler };
