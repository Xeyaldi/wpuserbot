// Group Handler - Welcome/Goodbye - Developer: Xeyal
async function welcomeHandler(sock, update) {
  const { id: jid, participants, action } = update;

  try {
    const groupMeta = await sock.groupMetadata(jid);
    const groupName = groupMeta.subject;

    for (const participant of participants) {
      const num = participant.split('@')[0];

      if (action === 'add') {
        const welcomeText = `🎉 *Xoş gəldiniz!*\n\n` +
          `👋 Salam @${num}!\n` +
          `📌 *${groupName}* qrupuna xoş gəldiniz!\n\n` +
          `🔹 Qrup qaydalarına hörmət edin\n` +
          `🔹 Spam etməyin\n` +
          `🔹 Xoş söhbətlər! 😊`;

        await sock.sendMessage(jid, {
          text: welcomeText,
          mentions: [participant]
        });

      } else if (action === 'remove') {
        const goodbyeText = `👋 *Görüşənədək!*\n\n` +
          `@${num} qrupu tərk etdi.\n` +
          `*${groupName}* qrupundan ayrıldı. Ən yaxşısını arzulayırıq! 🙏`;

        await sock.sendMessage(jid, {
          text: goodbyeText,
          mentions: [participant]
        });
      }
    }
  } catch (err) {
    console.error('Group handler xəta:', err.message);
  }
}

module.exports = { welcomeHandler };
