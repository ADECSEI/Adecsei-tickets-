const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  name: 'msg',
  description: 'Envía un mensaje embed mencionando un canal, usuario o rol',
  async execute(message, args, client) {
    if (!message.guild) return;

    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ No tienes permisos para usar este comando.');
    }

    if (args.length < 2) {
      return message.reply(
        '❌ **Uso correcto:**\n' +
        '`!msg #canal Tu mensaje aquí`\n' +
        '`!msg @usuario Tu mensaje aquí`\n' +
        '`!msg @rol Tu mensaje aquí`'
      );
    }

    const target = args[0];
    const msgText = args.slice(1).join(' ');

    let targetChannel = null;
    let mention = '@everyone';

    const channelMatch = target.match(/^<#(\d+)>$/);
    const userMatch = target.match(/^<@!?(\d+)>$/);
    const roleMatch = target.match(/^<@&(\d+)>$/);

    if (channelMatch) {
      const ch = message.guild.channels.cache.get(channelMatch[1]);
      if (ch && ch.type === ChannelType.GuildText) {
        targetChannel = ch;
        mention = '@everyone';
      }
    } else if (userMatch) {
      targetChannel = message.channel;
      mention = `<@${userMatch[1]}>`;
    } else if (roleMatch) {
      targetChannel = message.channel;
      mention = `<@&${roleMatch[1]}>`;
    } else {
      targetChannel = message.channel;
      mention = '@everyone';
    }

    if (!targetChannel) {
      return message.reply('❌ Canal no encontrado.');
    }

    const embed = new EmbedBuilder()
      .setColor(0x2b0033)
      .setTitle('📢 Mensaje Oficial')
      .setDescription(msgText)
      .addFields({ name: '📌 Enviado por', value: `<@${message.author.id}>`, inline: true })
      .setFooter({ text: '✦ ADECSEI GROUP ✦' })
      .setTimestamp();

    await targetChannel.send({ content: mention, embeds: [embed] });

    if (targetChannel.id !== message.channel.id) {
      await message.reply(`✅ Mensaje enviado a <#${targetChannel.id}>`);
    }

    await message.delete().catch(() => {});
  },
};
