// Media Commands - Developer: Xeyal
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { tmpdir } = require('os');

// ── Şəkildən Stiker ─────────────────────────────────────────
async function makeSticker(ctx) {
  const { sock, msg, jid, msgType } = ctx;
  
  let mediaMsg = null;
  let mimeType = '';

  // Reply edilmiş mesajı yoxla
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quotedMsg?.imageMessage) {
    mediaMsg = quotedMsg.imageMessage;
    mimeType = 'image';
  } else if (quotedMsg?.videoMessage) {
    mediaMsg = quotedMsg.videoMessage;
    mimeType = 'video';
  } else if (msg.message?.imageMessage) {
    mediaMsg = msg.message.imageMessage;
    mimeType = 'image';
  } else if (msg.message?.videoMessage) {
    mediaMsg = msg.message.videoMessage;
    mimeType = 'video';
  }

  if (!mediaMsg) {
    return sock.sendMessage(jid, {
      text: '❓ *Stiker yaratmaq üçün:*\n1. Şəkil/video göndərin + .stiker caption əlavə edin\n2. Şəkilə/videoya reply edib .stiker yazın'
    }, { quoted: msg });
  }

  try {
    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });

    // Media bufferini yüklə
    const buffer = await sock.downloadMediaMessage(
      mimeType === 'image' 
        ? { message: { imageMessage: mediaMsg } }
        : { message: { videoMessage: mediaMsg } }
    );

    const BOT_NAME = process.env.BOT_NAME || 'Xeyal Userbot';
    const OWNER_NAME = process.env.OWNER_NAME || 'Xeyal';

    await sock.sendMessage(jid, {
      sticker: buffer,
      stickerAuthor: OWNER_NAME,
      stickerName: BOT_NAME
    }, { quoted: msg });

    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
  } catch (err) {
    console.error('Stiker xəta:', err.message);
    await sock.sendMessage(jid, { text: `❌ Stiker yaradılarkən xəta: ${err.message}` }, { quoted: msg });
  }
}

// ── Stikeri Şəkilə Çevir ────────────────────────────────────
async function stickerToImg(ctx) {
  const { sock, msg, jid } = ctx;
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  
  if (!quotedMsg?.stickerMessage) {
    return sock.sendMessage(jid, { text: '❓ Bir stikera reply edib .stikertoimg yazın!' }, { quoted: msg });
  }

  try {
    const buffer = await sock.downloadMediaMessage({ message: { stickerMessage: quotedMsg.stickerMessage } });
    await sock.sendMessage(jid, {
      image: buffer,
      caption: '🖼️ *Stiker şəkilə çevrildi!*'
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Çevirmə xətası: ${err.message}` }, { quoted: msg });
  }
}

// ── OCR - Şəkildən Mətn ─────────────────────────────────────
async function ocr(ctx) {
  const { sock, msg, jid } = ctx;
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  
  if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
    return sock.sendMessage(jid, { text: '❓ Bir şəkilə reply edib .ocr yazın!' }, { quoted: msg });
  }

  try {
    await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
    
    const imgMsg = quotedMsg?.imageMessage || msg.message?.imageMessage;
    const buffer = await sock.downloadMediaMessage({ message: { imageMessage: imgMsg } });
    
    // Tesseract.js ilə mətn oxu
    const Tesseract = require('tesseract.js');
    const tmpFile = path.join(tmpdir(), `ocr_${Date.now()}.jpg`);
    await fs.writeFile(tmpFile, buffer);
    
    const { data: { text } } = await Tesseract.recognize(tmpFile, 'aze+eng+rus', {
      logger: () => {}
    });
    
    await fs.remove(tmpFile);
    
    if (!text.trim()) {
      return sock.sendMessage(jid, { text: '⚠️ Şəkildə oxuna bilən mətn tapılmadı.' }, { quoted: msg });
    }

    await sock.sendMessage(jid, {
      text: `📖 *OCR - Şəkildən Mətn*\n\n${text.trim()}`
    }, { quoted: msg });
    
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ OCR xətası: ${err.message}` }, { quoted: msg });
  }
}

// ── TikTok Yüklə ────────────────────────────────────────────
async function tiktok(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query || !query.includes('tiktok.com')) {
    return sock.sendMessage(jid, { text: '❓ *İstifadə:* .tiktok [link]\n*Nümunə:* .tiktok https://www.tiktok.com/...' }, { quoted: msg });
  }

  try {
    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });
    
    // TikTok API - watermarksız yüklə
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(query)}&hd=1`;
    const res = await axios.get(apiUrl, { timeout: 15000 });
    
    if (!res.data?.data?.play) {
      return sock.sendMessage(jid, { text: '❌ TikTok linki tapılmadı və ya etibarsızdır.' }, { quoted: msg });
    }

    const videoData = res.data.data;
    const videoUrl = videoData.hdplay || videoData.play;
    const title = videoData.title || 'TikTok Video';
    const author = videoData.author?.nickname || 'Naməlum';

    // Videonu axtar
    const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const videoBuffer = Buffer.from(videoRes.data);

    await sock.sendMessage(jid, {
      video: videoBuffer,
      caption: `📥 *TikTok Video Yükləndi!*\n\n👤 Müəllif: @${author}\n📝 ${title.slice(0, 100)}`,
      mimetype: 'video/mp4'
    }, { quoted: msg });

    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ TikTok yükləmə xətası: ${err.message}` }, { quoted: msg });
  }
}

module.exports = { makeSticker, stickerToImg, ocr, tiktok };
