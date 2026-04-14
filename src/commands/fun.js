// Fun Commands - Developer: Xeyal
const zarafatlar = [
  "🤣 Müəllim: 'Hamınız uğursuz oldunuz!'\nŞagird: 'Hamı? Onda ortalama yaxşıdır.'",
  "😂 Həkim: 'Siz çox az su içirsiniz.'\nXəstə: 'Bəs pivə?'\nHəkim: 'O başqa şeydir...'\nXəstə: 'Elə bilirdim!'",
  "😄 Arvad: 'Niyə bu qədər xoruldayırsan?'\nEr: 'Yatmaqda şampiyon olmağa çalışıram.'",
  "🤣 Uşaq: 'Ata, robot olmaq istəyirəm!'\nAta: 'Olmaq üçün ev işlərini et.'\nUşaq: 'Anladım, robot olmaq istəmirəm.'",
  "😂 Sürücü: 'Niyə qırmızı işıqda keçdin?'\nYolçu: 'Yaşıl işığı görməmişdim, birdən getdi.'",
  "😄 İki computer mütəxəssisi danışır:\n'Həyatım necədir?' - 'Null pointer exception var.'",
  "🤣 Müəllim: '2+2 neçədir?'\nŞagird: 'Nə demək istəyirsiniz?' - 'Necə yəni?' - 'Riyaziyyatda, yoxsa həyatda?'",
  "😂 Dost: 'Yuxuda nə gördün?'\nO biri: 'Heç nə, çox sürətli yatmışdım.'",
  "😄 Proqramçı arvadına: 'Bazara get, 1 çörək al, yumurta varsa 6 dənə gətir.'\nArvad 6 çörəklə qayıtdı.",
  "🤣 Həkim: 'Siqaret çəkirsiniz?'\nXəstə: 'Xeyr.'\nHəkim: 'İçki içirsiniz?'\nXəstə: 'Xeyr.'\nHəkim: 'Bəs nə üçün yaşayırsınız?'"
];

const atalarSozleri = [
  "🌟 Elm öyrən beşikdən qəbrə kimi.",
  "💪 Əl əli yuyar, əllər üzü.",
  "📚 Oxuyan göz aydın olar.",
  "🌱 Ağacı yaşında, insanı yaşında.",
  "🔨 Zəhmət çəkmədən nemət olmaz.",
  "🌹 Gül dikənsiz olmaz.",
  "🏡 El gücü - sel gücü.",
  "⭐ Hər gecənin bir səhəri var.",
  "🦁 Arslan yatanda da arslandır.",
  "🌊 Damla damla göl olar.",
  "🤝 Dost başa baxar, düşmən ayağa.",
  "🌞 Səbr edən muradına çatar.",
  "📖 Bilik - qılıncdan itidir.",
  "🌳 Kökü möhkəm ağac küləkdən qorxmaz.",
  "💡 Bir anlıq səbr, ömürlük peşmançılığın qarşısını alar."
];

const sitatlar = [
  "💭 \"Uğur — son nöqtə deyil, uğursuzluq — ölümcül deyil; davam etmək lazım olan cəsarətdir.\" — Churchill",
  "🌟 \"Özünüzə inanın. Heç kim sizin üçün inanmayacaq.\" — Suzy Kassem",
  "💪 \"Hər böyük iş kiçik addımla başlayır.\" — Lao Tzu",
  "📚 \"Kitablar — ən sakit və davamlı dostlardır.\" — Charles W. Eliot",
  "🎯 \"Həyatın mənası kəşf etməkdə yox, yaratmaqdadır.\" — Shaw",
  "🚀 \"İmkansız söz yalnız lüğətdə var.\" — Napoleon",
  "🌈 \"Hər günü ömrünün ən gözəl günü say.\" — Emerson",
  "⭐ \"Zəkadan daha çox əzmkarlıq vacibdir.\" — Edison",
  "🦋 \"Dəyişmək istədiyin dünyada özün dəyişkənlik ol.\" — Gandhi",
  "💡 \"Düşüncə dünyası əsl azadlıqdır.\" — Marcus Aurelius"
];

async function joke(ctx) {
  const { sock, msg, jid } = ctx;
  const zarafat = zarafatlar[Math.floor(Math.random() * zarafatlar.length)];
  await sock.sendMessage(jid, {
    text: `🎭 *Azərbaycan Zarafatı*\n\n${zarafat}`
  }, { quoted: msg });
}

async function proverb(ctx) {
  const { sock, msg, jid } = ctx;
  const atalar = atalarSozleri[Math.floor(Math.random() * atalarSozleri.length)];
  await sock.sendMessage(jid, {
    text: `📜 *Atalar Sözü*\n\n${atalar}`
  }, { quoted: msg });
}

async function quote(ctx) {
  const { sock, msg, jid } = ctx;
  const sitat = sitatlar[Math.floor(Math.random() * sitatlar.length)];
  await sock.sendMessage(jid, {
    text: `✨ *Məşhur Sitat*\n\n${sitat}`
  }, { quoted: msg });
}

async function dice(ctx) {
  const { sock, msg, jid } = ctx;
  const result = Math.floor(Math.random() * 6) + 1;
  const emojis = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
  await sock.sendMessage(jid, {
    text: `🎲 *Zər Atıldı!*\n\nNəticə: ${emojis[result]} *(${result})*`
  }, { quoted: msg });
}

async function choose(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .seç [a|b|c]\n*Nümunə:* .seç pizza|burger|döner' }, { quoted: msg });
  const options = query.split('|').map(s => s.trim()).filter(Boolean);
  if (options.length < 2) return sock.sendMessage(jid, { text: '⚠️ Ən azı 2 seçim daxil edin! Seçimləri | ilə ayırın.' }, { quoted: msg });
  const chosen = options[Math.floor(Math.random() * options.length)];
  await sock.sendMessage(jid, {
    text: `🎯 *Seçim Edildi!*\n\n🔮 Seçimlər: ${options.join(' | ')}\n\n✅ Seçim: *${chosen}*`
  }, { quoted: msg });
}

module.exports = { joke, proverb, quote, dice, choose };
