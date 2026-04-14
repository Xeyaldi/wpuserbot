// AI Commands - OpenAI GPT-4o - Developer: Xeyal
const OpenAI = require('openai');

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function chat(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) {
    return sock.sendMessage(jid, { text: '❓ *İstifadə:* .ai [sualınız]\n\n*Nümunə:* .ai Azərbaycan paytaxtı nədir?' }, { quoted: msg });
  }
  const client = getClient();
  if (!client) {
    return sock.sendMessage(jid, { text: '❌ OpenAI API açarı tapılmadı! .env faylını yoxlayın.' }, { quoted: msg });
  }
  await sock.sendMessage(jid, { react: { text: '🤔', key: msg.key } });
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sən Xeyal tərəfindən hazırlanmış WhatsApp userbotunun AI köməkçisisən. Azərbaycan dilində cavab verirsən. Qısa, dəqiq və faydalı cavablar ver.' },
        { role: 'user', content: query }
      ],
      max_tokens: 1000
    });
    const answer = response.choices[0]?.message?.content || 'Cavab alınmadı.';
    await sock.sendMessage(jid, {
      text: `🤖 *Xeyal AI*\n\n${answer}`
    }, { quoted: msg });
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ AI xətası: ${err.message}` }, { quoted: msg });
  }
}

async function analyze(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) {
    return sock.sendMessage(jid, { text: '❓ *İstifadə:* .analiz [mövzu]\n\n*Nümunə:* .analiz süni intellekt' }, { quoted: msg });
  }
  const client = getClient();
  if (!client) return sock.sendMessage(jid, { text: '❌ OpenAI API açarı yoxdur!' }, { quoted: msg });
  await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sən dərin analiz mütəxəssisisən. Verilən mövzunu ətraflı, strukturlu və Azərbaycan dilində analiz et. Başlıqlar, alt başlıqlar, artılar/eksiler, nəticə bölmələri ilə.' },
        { role: 'user', content: `"${query}" mövzusunu dərindən analiz et.` }
      ],
      max_tokens: 1500
    });
    const answer = response.choices[0]?.message?.content || 'Analiz alınmadı.';
    await sock.sendMessage(jid, {
      text: `📊 *Dərin Analiz: ${query}*\n\n${answer}`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Analiz xətası: ${err.message}` }, { quoted: msg });
  }
}

async function code(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) {
    return sock.sendMessage(jid, { text: '❓ *İstifadə:* .kod [nə etsin]\n\n*Nümunə:* .kod Python-da fibonacci ardıcıllığı yaz' }, { quoted: msg });
  }
  const client = getClient();
  if (!client) return sock.sendMessage(jid, { text: '❌ OpenAI API açarı yoxdur!' }, { quoted: msg });
  await sock.sendMessage(jid, { react: { text: '💻', key: msg.key } });
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sən proqramlaşdırma mütəxəssisisən. Kod yazırsın, izah edirsən. Azərbaycan dilində izahat ver, kodu kod bloku içərisində göstər.' },
        { role: 'user', content: query }
      ],
      max_tokens: 1500
    });
    const answer = response.choices[0]?.message?.content || 'Kod alınmadı.';
    await sock.sendMessage(jid, {
      text: `💻 *AI Kod*\n\n${answer}`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Kod xətası: ${err.message}` }, { quoted: msg });
  }
}

module.exports = { chat, analyze, code };
