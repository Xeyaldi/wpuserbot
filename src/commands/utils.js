// Utils Commands - Developer: Xeyal
const axios = require('axios');
const QRCode = require('qrcode');
const { create, all } = require('mathjs');
const math = create(all);
const fs = require('fs-extra');
const path = require('path');
const settingsPath = path.join(__dirname, '../../data/settings.json');

// ── AFK Yoxlama Məntiqi (Avtomatik Cavab Vermə) ──────────────
async function handleAfkCheck(ctx) {
  const { sock, msg, jid, sender } = ctx;
  const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
  if (!settings.afkUsers) return;

  const myNum = sock.user.id.split(':')[0];

  // 1. Əgər AFK olan şəxs (sən) mesaj yazsa, AFK-dan çıxart
  if (sender.includes(myNum) && settings.afkUsers[myNum]) {
    delete settings.afkUsers[myNum];
    fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
    return sock.sendMessage(jid, { text: '✅ *Artıq aktivsiniz! AFK rejimi ləğv edildi.*' }, { quoted: msg });
  }

  // 2. Kimsə səni tag edərsə və ya sənə yazarsa səbəbi göndər
  const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  for (let afkNum in settings.afkUsers) {
    if (mentionedJids.includes(`${afkNum}@s.whatsapp.net`) || (!jid.endsWith('@g.us') && jid.includes(afkNum))) {
      const data = settings.afkUsers[afkNum];
      const timeDiff = Math.floor((Date.now() - data.time) / 60000);
      const text = `😴 *Hazırda AFK-dır!*\n\n📝 *Səbəb:* ${data.reason}\n⏱ *Nə vaxtdan:* ${timeDiff} dəqiqə əvvəl`;
      await sock.sendMessage(jid, { text }, { quoted: msg });
    }
  }
}

// ── Hava Məlumatı ───────────────────────────────────────────
async function weather(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .hava [şəhər]\n*Nümunə:* .hava Bakı' }, { quoted: msg });
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) return sock.sendMessage(jid, { text: '❌ WEATHER_API_KEY tapılmadı! .env faylını yoxlayın.' }, { quoted: msg });
  try {
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: { q: query, appid: apiKey, units: 'metric', lang: 'az' }
    });
    const d = res.data;
    const icons = { Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Snow: '❄️', Thunderstorm: '⛈️', Drizzle: '🌦️', Mist: '🌫️', Fog: '🌫️' };
    const icon = icons[d.weather[0].main] || '🌡️';
    const text = `${icon} *${d.name}, ${d.sys.country} Hava Məlumatı*\n\n` +
      `🌡️ Temperatur: *${Math.round(d.main.temp)}°C*\n` +
      `🤔 Hiss edilən: *${Math.round(d.main.feels_like)}°C*\n` +
      `💧 Rütubət: *${d.main.humidity}%*\n` +
      `💨 Külək: *${d.wind.speed} m/s*\n` +
      `☁️ Vəziyyət: *${d.weather[0].description}*\n` +
      `⬆️ Maksimum: *${Math.round(d.main.temp_max)}°C*\n` +
      `⬇️ Minimum: *${Math.round(d.main.temp_min)}°C*\n` +
      `👁️ Görünüş: *${Math.round(d.visibility / 1000)} km*`;
    await sock.sendMessage(jid, { text }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Şəhər tapılmadı: *${query}*\nDüzgün şəhər adı daxil edin.` }, { quoted: msg });
  }
}

// ── Mətn Tərcüməsi ──────────────────────────────────────────
async function translate(ctx) {
  const { sock, msg, jid, args, query } = ctx;
  if (args.length < 3) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .cevir [dil] [mətn]\n*Nümunə:* .cevir en Salam dünya' }, { quoted: msg });
  const targetLang = args[1];
  const textToTranslate = args.slice(2).join(' ');
  try {
    const res = await axios.get(`https://api.mymemory.translated.net/get`, {
      params: { q: textToTranslate, langpair: `auto|${targetLang}` }
    });
    const translated = res.data.responseData.translatedText;
    await sock.sendMessage(jid, {
      text: `🌐 *Tərcümə*\n\n📝 *Orijinal:* ${textToTranslate}\n🔄 *Tərcümə (${targetLang}):* ${translated}`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Tərcümə xətası baş verdi.' }, { quoted: msg });
  }
}

// ── QR Kod ─────────────────────────────────────────────────
async function qrCode(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .qr [mətn]\n*Nümunə:* .qr https://google.com' }, { quoted: msg });
  try {
    const qrBuffer = await QRCode.toBuffer(query, { width: 400, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });
    await sock.sendMessage(jid, {
      image: qrBuffer,
      caption: `📱 *QR Kod yaradıldı!*\n📝 Mətn: ${query}`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ QR kod yaradılarkən xəta.' }, { quoted: msg });
  }
}

// ── Hesablama ───────────────────────────────────────────────
async function calculate(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .hesabla [ifadə]\n*Nümunə:* .hesabla 25 * 4 + sqrt(16)' }, { quoted: msg });
  try {
    const result = math.evaluate(query);
    await sock.sendMessage(jid, {
      text: `🔢 *Hesablama*\n\n📝 İfadə: \`${query}\`\n✅ Nəticə: *${result}*`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Hesablama xətası: Düzgün riyazi ifadə daxil edin.\n*Nümunə:* .hesabla 2 + 2 * 3` }, { quoted: msg });
  }
}

// ── Şifrə Generator ─────────────────────────────────────────
async function password(ctx) {
  const { sock, msg, jid, args } = ctx;
  const length = parseInt(args[1]) || 16;
  if (length < 4 || length > 100) return sock.sendMessage(jid, { text: '❌ Uzunluq 4-100 arasında olmalıdır.' }, { quoted: msg });
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += charset[Math.floor(Math.random() * charset.length)];
  }
  await sock.sendMessage(jid, {
    text: `🔐 *Şifrə Generatoru*\n\n🔑 Şifrə: \`${pass}\`\n📏 Uzunluq: ${length} simvol\n\n⚠️ Bu şifrəni heç kimlə paylaşmayın!`
  }, { quoted: msg });
}

// ── Kripto Qiymətləri ───────────────────────────────────────
async function crypto(ctx) {
  const { sock, msg, jid, args } = ctx;
  if (args.length < 3) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .coinçevir [miqdar] [coin]\n*Nümunə:* .coinçevir 1 bitcoin' }, { quoted: msg });
  const amount = parseFloat(args[1]);
  const coin = args[2].toLowerCase();
  try {
    const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: { ids: coin, vs_currencies: 'usd,eur,try,azn' }
    });
    const data = res.data[coin];
    if (!data) return sock.sendMessage(jid, { text: `❌ *${coin}* tapılmadı!` }, { quoted: msg });
    const text = `💰 *${coin.toUpperCase()} Qiymətləri*\n\n` +
      `📊 ${amount} ${coin.toUpperCase()} =\n` +
      `💵 USD: *$${(data.usd * amount).toFixed(2)}*\n` +
      `💶 EUR: *€${(data.eur * amount).toFixed(2)}*\n` +
      `💴 TRY: *₺${(data.try * amount).toFixed(2)}*\n` +
      `🇦🇿 AZN: *₼${(data.azn * amount).toFixed(2)}*`;
    await sock.sendMessage(jid, { text }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Kripto məlumatı alınarkən xəta.' }, { quoted: msg });
  }
}

// ── Valyuta Kursu ───────────────────────────────────────────
async function currency(ctx) {
  const { sock, msg, jid, args } = ctx;
  if (args.length < 4) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .valyuta [miqdar] [from] [to]\n*Nümunə:* .valyuta 100 USD AZN' }, { quoted: msg });
  const amount = parseFloat(args[1]);
  const from = args[2].toUpperCase();
  const to = args[3].toUpperCase();
  try {
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const rate = res.data.rates[to];
    if (!rate) return sock.sendMessage(jid, { text: `❌ *${to}* valyutası tapılmadı!` }, { quoted: msg });
    const result = (amount * rate).toFixed(2);
    await sock.sendMessage(jid, {
      text: `💱 *Valyuta Çevirmə*\n\n${amount} ${from} = *${result} ${to}*\n📈 Kurs: 1 ${from} = ${rate.toFixed(4)} ${to}`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Valyuta məlumatı alınarkən xəta.' }, { quoted: msg });
  }
}

// ── IP Axtarışı ─────────────────────────────────────────────
async function ipLookup(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .ip [ünvan]\n*Nümunə:* .ip 8.8.8.8' }, { quoted: msg });
  try {
    const res = await axios.get(`http://ip-api.com/json/${query}?lang=az`);
    const d = res.data;
    if (d.status === 'fail') return sock.sendMessage(jid, { text: `❌ IP tapılmadı: ${query}` }, { quoted: msg });
    const text = `🌐 *IP Məlumatı: ${d.query}*\n\n` +
      `🏳️ Ölkə: *${d.country}*\n` +
      `🏙️ Şəhər: *${d.city}*\n` +
      `📍 Region: *${d.regionName}*\n` +
      `🏢 ISP: *${d.isp}*\n` +
      `🔮 Org: *${d.org}*\n` +
      `🕐 Saat zolağı: *${d.timezone}*\n` +
      `📌 Koordinat: *${d.lat}, ${d.lon}*`;
    await sock.sendMessage(jid, { text }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ IP axtarışında xəta.' }, { quoted: msg });
  }
}

// ── Link Qısaltma ───────────────────────────────────────────
async function shortenUrl(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .kısalt [link]\n*Nümunə:* .kısalt https://google.com' }, { quoted: msg });
  try {
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(query)}`);
    await sock.sendMessage(jid, {
      text: `🔗 *Link Qısaldıldı!*\n\n📎 Orijinal: ${query}\n✂️ Qısa: ${res.data}`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Link qısaldılarkən xəta.' }, { quoted: msg });
  }
}

// ── Urban Dictionary ────────────────────────────────────────
async function urbanDict(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .ud [söz]\n*Nümunə:* .ud yolo' }, { quoted: msg });
  try {
    const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`);
    const def = res.data.list[0];
    if (!def) return sock.sendMessage(jid, { text: `❌ *${query}* üçün tərif tapılmadı.` }, { quoted: msg });
    const text = `📖 *Urban Dictionary: ${def.word}*\n\n` +
      `📝 *Tərif:*\n${def.definition.slice(0, 500)}\n\n` +
      `💬 *Nümunə:*\n${def.example.slice(0, 300)}\n\n` +
      `👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}`;
    await sock.sendMessage(jid, { text }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Urban Dictionary xətası.' }, { quoted: msg });
  }
}

// ── AFK ─────────────────────────────────────────────────────
async function setAfk(ctx) {
  const { sock, msg, jid, query } = ctx;
  const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
  const myNum = sock.user.id.split(':')[0];
  const myName = sock.user.name || 'Xeyal';
  const reason = query || 'Səbəb göstərilməyib';
  if (!settings.afkUsers) settings.afkUsers = {};
  settings.afkUsers[myNum] = { reason, time: Date.now(), name: myName };
  fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
  await sock.sendMessage(jid, {
    text: `😴 *AFK Rejimi Aktivdir!*\n\n📝 Səbəb: ${reason}\n\nBiri sizi mention edəndə avtomatik bildiriş göndəriləcək.`
  }, { quoted: msg });
}

async function removeAfk(ctx) {
  const { sock, msg, jid } = ctx;
  const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
  const myNum = sock.user.id.split(':')[0];
  if (settings.afkUsers && settings.afkUsers[myNum]) {
    const timeDiff = Math.floor((Date.now() - settings.afkUsers[myNum].time) / 60000);
    delete settings.afkUsers[myNum];
    fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
    await sock.sendMessage(jid, {
      text: `✅ *AFK rejimindən çıxdınız!*\n⏱ ${timeDiff} dəqiqə AFK idiniz.`
    }, { quoted: msg });
  } else {
    await sock.sendMessage(jid, { text: '⚠️ Siz AFK deyildiniz.' }, { quoted: msg });
  }
}

// ── Toggle Funksiyaları ──────────────────────────────────────
async function toggleAntiDelete(ctx) {
  const { sock, msg, jid } = ctx;
  const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
  settings.antiDelete = !settings.antiDelete;
  fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
  await sock.sendMessage(jid, {
    text: `🛡️ *Anti-Delete ${settings.antiDelete ? '✅ Açıldı' : '❌ Bağlandı'}*`
  }, { quoted: msg });
}

async function togglePmPermit(ctx) {
  const { sock, msg, jid } = ctx;
  const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
  settings.pmPermit = !settings.pmPermit;
  fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
  await sock.sendMessage(jid, {
    text: `🔐 *PM Permit ${settings.pmPermit ? '✅ Açıldı' : '❌ Bağlandı'}*`
  }, { quoted: msg });
}

async function toggleAutoRead(ctx) {
  const { sock, msg, jid } = ctx;
  const settings = fs.readJsonSync(settingsPath, { throws: false }) || {};
  settings.autoRead = !settings.autoRead;
  fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
  await sock.sendMessage(jid, {
    text: `👁️ *Avtomatik Oxuma ${settings.autoRead ? '✅ Açıldı' : '❌ Bağlandı'}*`
  }, { quoted: msg });
}

module.exports = {
  weather, translate, qrCode, calculate, password, crypto, currency,
  ipLookup, shortenUrl, urbanDict, setAfk, removeAfk, handleAfkCheck,
  toggleAntiDelete, togglePmPermit, toggleAutoRead
};
