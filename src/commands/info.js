// Info Commands - Developer: Xeyal
const os = require('os');

async function help(ctx) {
  const { sock, msg, jid } = ctx;
  const PREFIX = process.env.PREFIX || '.';
  const BOT_NAME = process.env.BOT_NAME || 'Xeyal Userbot';

  const menuText = `╔══════════════════════════════╗
║     🤖 ${BOT_NAME}     ║
║        Developer: Xeyal      ║
╚══════════════════════════════╝

━━━ 🤖 AI Komutları ━━━
${PREFIX}ai [sual] — GPT-4o ilə söhbət
${PREFIX}analiz [mövzu] — Dərin analiz
${PREFIX}kod [sual] — AI kod yarat

━━━ 🌍 Məlumat ━━━
${PREFIX}hava [şəhər] — Hava məlumatı
${PREFIX}cevir [dil] [mətn] — Tərcümə
${PREFIX}ud [söz] — Urban Dictionary
${PREFIX}ip [ünvan] — IP məlumatı

━━━ 💰 Maliyyə ━━━
${PREFIX}coinçevir [miq] [coin] — Kripto
${PREFIX}valyuta [miq] [from] [to] — Valyuta

━━━ 🛠️ Alətlər ━━━
${PREFIX}qr [mətn] — QR kod yarat
${PREFIX}hesabla [ifadə] — Riyazi hesab
${PREFIX}şifrə [uzunluq] — Şifrə yarat
${PREFIX}kısalt [link] — Link qısalt
${PREFIX}ocr — Şəkildən mətn oxu

━━━ 📥 Media ━━━
${PREFIX}stiker — Şəkildən stiker
${PREFIX}stikertoimg — Stikeri şəkilə çevir
${PREFIX}tiktok [link] — TikTok yüklə

━━━ 😴 AFK ━━━
${PREFIX}afk [səbəb] — AFK rejiminə keç
${PREFIX}geri — AFK-dan çıx

━━━ 🎮 Əyləncə ━━━
${PREFIX}zarafat — Zarafat
${PREFIX}atalar — Atalar sözü
${PREFIX}sitatlar — Məşhur sitat
${PREFIX}zər — Zər at
${PREFIX}seç [a|b|c] — Seçim et

━━━ 👥 Qrup ━━━
${PREFIX}qrupinfo — Qrup məlumatı
${PREFIX}qruplink — Dəvət linki
${PREFIX}qrupad [nömrə] — Üzv əlavə et
${PREFIX}qrupçıxar — Üzv çıxar
${PREFIX}mute — Qrubu sustur
${PREFIX}unmute — Qrubu açıq et
${PREFIX}alqrup — Üzv siyahısı
${PREFIX}broadcast [mətn] — Hamıya yay

━━━ ⚙️ Sistem ━━━
${PREFIX}antidelete — Anti-delete aç/bağla
${PREFIX}pmpermit — PM icazəsi aç/bağla
${PREFIX}autookuma — Avtomatik oxuma
${PREFIX}ping — Bot gecikmə
${PREFIX}vaxt — Cari vaxt
${PREFIX}info — Bot haqqında
${PREFIX}id — Chat/User ID
${PREFIX}sistem — Server məlumatı
${PREFIX}tertibatci — Developer məlumatı
${PREFIX}restart — Botu yenidən başlat`;

  await sock.sendMessage(jid, { text: menuText }, { quoted: msg });
}

async function ping(ctx) {
  const { sock, msg, jid } = ctx;
  const start = Date.now();
  await sock.sendMessage(jid, { text: '🏓 Ölçülür...' }, { quoted: msg });
  const end = Date.now();
  await sock.sendMessage(jid, {
    text: `🏓 *Pong!*\n\n⚡ Gecikmə: *${end - start}ms*\n🟢 Bot aktifdir!`
  }, { quoted: msg });
}

async function time(ctx) {
  const { sock, msg, jid } = ctx;
  const now = new Date();
  const options = { timeZone: 'Asia/Baku', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const azTime = now.toLocaleString('az-AZ', options);
  await sock.sendMessage(jid, {
    text: `🕐 *Cari Vaxt (Bakı)*\n\n📅 ${azTime}\n🌍 Saat zolağı: Asia/Baku (UTC+4)`
  }, { quoted: msg });
}

async function botInfo(ctx) {
  const { sock, msg, jid } = ctx;
  const BOT_NAME = process.env.BOT_NAME || 'Xeyal Userbot';
  const OWNER_NAME = process.env.OWNER_NAME || 'Xeyal';
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const text = `🤖 *${BOT_NAME}*\n\n` +
    `👤 Sahibi: *${OWNER_NAME}*\n` +
    `👨‍💻 Developer: *Xeyal*\n` +
    `📦 Versiya: *v2.0.0*\n` +
    `⏱ Uptime: *${h}s ${m}d ${s}s*\n` +
    `🌐 Platform: *Node.js ${process.version}*\n` +
    `📚 Kitabxana: *@whiskeysockets/baileys*\n` +
    `\n✨ Hazırlanmış: Xeyal tərəfindən`;
  await sock.sendMessage(jid, { text }, { quoted: msg });
}

async function getId(ctx) {
  const { sock, msg, jid, isGroup, sender } = ctx;
  const text = `🆔 *ID Məlumatları*\n\n` +
    `💬 Chat JID: \`${jid}\`\n` +
    `👤 Göndərən: \`${sender}\`\n` +
    `📨 Mesaj ID: \`${msg.key.id}\`\n` +
    `🤖 Bot: \`${sock.user.id}\`\n` +
    `👥 Qrup: ${isGroup ? '✅ Bəli' : '❌ Xeyr'}`;
  await sock.sendMessage(jid, { text }, { quoted: msg });
}

async function groupInfo(ctx) {
  const { sock, msg, jid, isGroup } = ctx;
  if (!isGroup) return sock.sendMessage(jid, { text: '⚠️ Bu komut yalnız qruplarda işləyir!' }, { quoted: msg });
  try {
    const meta = await sock.groupMetadata(jid);
    const admins = meta.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`).join(', ');
    const text = `👥 *Qrup Məlumatı*\n\n` +
      `📌 Ad: *${meta.subject}*\n` +
      `🆔 ID: \`${jid}\`\n` +
      `👤 Üzvlər: *${meta.participants.length}*\n` +
      `👑 Adminlər: *${meta.participants.filter(p => p.admin).length}*\n` +
      `📅 Yaradılıb: *${new Date(meta.creation * 1000).toLocaleDateString('az-AZ')}*\n` +
      `📝 Təsvir: ${meta.desc || 'Yoxdur'}`;
    await sock.sendMessage(jid, { text }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Qrup məlumatı alınarkən xəta.' }, { quoted: msg });
  }
}

async function system(ctx) {
  const { sock, msg, jid } = ctx;
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);
  const uptime = os.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const cpus = os.cpus();
  const text = `💻 *Server Məlumatı*\n\n` +
    `🖥️ OS: *${os.type()} ${os.arch()}*\n` +
    `💾 RAM: *${usedMem}/${totalMem} GB*\n` +
    `🔲 CPU: *${cpus[0]?.model} (${cpus.length} nüvə)*\n` +
    `⏱ Server Uptime: *${h}s ${m}d*\n` +
    `⚡ Bot Uptime: *${Math.floor(process.uptime() / 60)} dəqiqə*\n` +
    `🌐 Node.js: *${process.version}*`;
  await sock.sendMessage(jid, { text }, { quoted: msg });
}

async function developer(ctx) {
  const { sock, msg, jid } = ctx;
  const text = `👨‍💻 *Tertibatçı Məlumatı*\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🧑‍💻 Ad: *Xeyal*\n` +
    `🤖 Bot: *Xeyal Userbot v2.0*\n` +
    `📚 Dil: *JavaScript (Node.js)*\n` +
    `📦 Kitabxana: *Baileys + OpenAI*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `\n✨ Bu bot Xeyal tərəfindən sevgi ilə hazırlanmışdır 💙\n` +
    `\n🔐 Bütün hüquqlar qorunur © 2024 Xeyal`;
  await sock.sendMessage(jid, { text }, { quoted: msg });
}

async function restart(ctx) {
  const { sock, msg, jid } = ctx;
  await sock.sendMessage(jid, { text: '🔄 *Bot yenidən başladılır...*\n\nBir neçə saniyə gözləyin.' }, { quoted: msg });
  setTimeout(() => process.exit(0), 2000);
}

module.exports = { help, ping, time, botInfo, getId, groupInfo, system, developer, restart };
