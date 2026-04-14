// Group Commands - Admin Functions - Developer: Xeyal
async function getLink(ctx) {
  const { sock, msg, jid, isGroup } = ctx;
  if (!isGroup) return sock.sendMessage(jid, { text: '⚠️ Yalnız qruplarda işləyir!' }, { quoted: msg });
  try {
    const code = await sock.groupInviteCode(jid);
    await sock.sendMessage(jid, {
      text: `🔗 *Qrup Dəvət Linki*\n\nhttps://chat.whatsapp.com/${code}`
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Link almaq üçün admin olmalısınız!' }, { quoted: msg });
  }
}

async function addMember(ctx) {
  const { sock, msg, jid, isGroup, args } = ctx;
  if (!isGroup) return sock.sendMessage(jid, { text: '⚠️ Yalnız qruplarda işləyir!' }, { quoted: msg });
  if (!args[1]) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .qrupad [nömrə]\n*Nümunə:* .qrupad 994501234567' }, { quoted: msg });
  const num = args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  try {
    await sock.groupParticipantsUpdate(jid, [num], 'add');
    await sock.sendMessage(jid, { text: `✅ @${args[1]} qrupa əlavə edildi!`, mentions: [num] }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Üzv əlavə edilə bilmədi: ${err.message}` }, { quoted: msg });
  }
}

async function removeMember(ctx) {
  const { sock, msg, jid, isGroup } = ctx;
  if (!isGroup) return sock.sendMessage(jid, { text: '⚠️ Yalnız qruplarda işləyir!' }, { quoted: msg });
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (!quoted) return sock.sendMessage(jid, { text: '❓ Çıxarılacaq mesajı reply edin!' }, { quoted: msg });
  try {
    await sock.groupParticipantsUpdate(jid, [quoted], 'remove');
    await sock.sendMessage(jid, { text: `✅ @${quoted.split('@')[0]} qrupdan çıxarıldı!`, mentions: [quoted] }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Üzv çıxarıla bilmədi: ${err.message}` }, { quoted: msg });
  }
}

async function muteGroup(ctx) {
  const { sock, msg, jid, isGroup } = ctx;
  if (!isGroup) return sock.sendMessage(jid, { text: '⚠️ Yalnız qruplarda işləyir!' }, { quoted: msg });
  try {
    await sock.groupSettingUpdate(jid, 'announcement');
    await sock.sendMessage(jid, { text: '🔇 *Qrup susturuldu!*\nYalnız adminlər mesaj göndərə bilər.' }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Admin icazəsi tələb olunur!' }, { quoted: msg });
  }
}

async function unmuteGroup(ctx) {
  const { sock, msg, jid, isGroup } = ctx;
  if (!isGroup) return sock.sendMessage(jid, { text: '⚠️ Yalnız qruplarda işləyir!' }, { quoted: msg });
  try {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await sock.sendMessage(jid, { text: '🔊 *Qrup açıldı!*\nHamı mesaj göndərə bilər.' }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Admin icazəsi tələb olunur!' }, { quoted: msg });
  }
}

async function getMemberList(ctx) {
  const { sock, msg, jid, isGroup } = ctx;
  if (!isGroup) return sock.sendMessage(jid, { text: '⚠️ Yalnız qruplarda işləyir!' }, { quoted: msg });
  try {
    const meta = await sock.groupMetadata(jid);
    const members = meta.participants;
    const adminList = members.filter(m => m.admin).map(m => `👑 @${m.id.split('@')[0]}`).join('\n');
    const memberList = members.filter(m => !m.admin).map(m => `👤 @${m.id.split('@')[0]}`).join('\n');
    const mentions = members.map(m => m.id);
    const text = `👥 *${meta.subject} - Üzv Siyahısı*\n\n` +
      `📊 Cəmi: *${members.length} üzv*\n` +
      `👑 Adminlər: *${members.filter(m => m.admin).length}*\n\n` +
      `━━ 👑 ADMİNLƏR ━━\n${adminList}\n\n` +
      `━━ 👤 ÜZVLƏR ━━\n${memberList}`;
    await sock.sendMessage(jid, { text, mentions }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Üzv siyahısı alınarkən xəta.' }, { quoted: msg });
  }
}

async function broadcast(ctx) {
  const { sock, msg, jid, query } = ctx;
  if (!query) return sock.sendMessage(jid, { text: '❓ *İstifadə:* .broadcast [mətn]' }, { quoted: msg });
  try {
    const chats = await sock.groupFetchAllParticipating();
    const groups = Object.keys(chats);
    let sent = 0;
    for (const groupJid of groups) {
      try {
        await sock.sendMessage(groupJid, {
          text: `📢 *Yayım Mesajı*\n\n${query}\n\n— ${process.env.OWNER_NAME || 'Xeyal'}`
        });
        sent++;
        await new Promise(r => setTimeout(r, 1000));
      } catch {}
    }
    await sock.sendMessage(jid, { text: `✅ Yayım tamamlandı!\n📤 ${sent}/${groups.length} qrupa göndərildi.` }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(jid, { text: `❌ Yayım xətası: ${err.message}` }, { quoted: msg });
  }
}

module.exports = { getLink, addMember, removeMember, muteGroup, unmuteGroup, getMemberList, broadcast };
