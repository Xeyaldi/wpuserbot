// Anti-Delete Handler - Developer: Xeyal
const fs = require('fs-extra');
const path = require('path');

const settingsPath = path.join(__dirname, '../../data/settings.json');
const msgStore = new Map();

async function antiDeleteHandler(sock, data, action) {
  const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
  if (!settings.antiDelete) return;

  if (action === 'save') {
    // Mesajı yadda saxla
    const msg = data;
    if (!msg?.key?.id) return;
    const text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 msg.message?.videoMessage?.caption || '';
    
    if (text || msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.audioMessage) {
      msgStore.set(msg.key.id, {
        jid: msg.key.remoteJid,
        sender: msg.key.participant || msg.key.remoteJid,
        pushName: msg.pushName || 'İstifadəçi',
        text,
        time: Date.now(),
        message: msg.message
      });

      // 10 dəqiqədən köhnə mesajları sil (yaddaş üçün)
      setTimeout(() => msgStore.delete(msg.key.id), 10 * 60 * 1000);
    }
  }

  if (action === 'delete') {
    const update = data;
    if (update.update?.message === null || update.update?.messageStubType === 1) {
      const saved = msgStore.get(update.key?.id);
      if (!saved) return;

      const isGroup = saved.jid?.endsWith('@g.us');
      const senderNum = saved.sender?.split('@')[0];
      
      let notifText = `🗑 *Anti-Delete Bildirişi*\n\n`;
      notifText += `👤 *Kim:* @${senderNum}\n`;
      notifText += `📍 *Yer:* ${isGroup ? 'Qrup' : 'Şəxsi'}\n`;
      notifText += `⏰ *Vaxt:* ${new Date(saved.time).toLocaleTimeString('az-AZ')}\n`;
      if (saved.text) {
        notifText += `\n💬 *Mesaj:*\n${saved.text}`;
      }

      // Özünə bildiriş göndər
      const myJid = sock.user?.id;
      if (myJid) {
        await sock.sendMessage(myJid, {
          text: notifText,
          mentions: [saved.sender]
        });
      }

      msgStore.delete(update.key?.id);
    }
  }
}

module.exports = { antiDeleteHandler };
