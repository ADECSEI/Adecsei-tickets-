const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member, client) {
    try {
      const guild = member.guild;
      const systemChannel = guild.systemChannel;
      if (!systemChannel) return;

      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const embed = new EmbedBuilder()
        .setColor(0x2b0033)
        .setTitle('🌑 Las sombras te esperaban…')
        .setDescription(
          `Las sombras susurran tu nombre, **${member.user.username}**…\n\nnadie sabe qué harás, pero todos lo temen.\n\nSiembra caos, deja pistas… y nunca reveles tus intenciones. 😈`
        )
        .addFields(
          { name: '👤 Usuario', value: `<@${member.user.id}> (\`${member.user.tag}\`)`, inline: true },
          { name: '📅 Fecha de entrada', value: `\`${dateStr}\``, inline: false },
          { name: '🕐 Hora de entrada', value: `\`${timeStr}\``, inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: '✦ ADECSEI GROUP ✦' })
        .setTimestamp();

      await systemChannel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Error en guildMemberAdd:', err);
    }
  },
};

