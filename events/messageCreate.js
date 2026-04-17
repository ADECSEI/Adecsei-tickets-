const { Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`Error ejecutando ${commandName}:`, err);
      await message.reply('❌ Ocurrió un error al ejecutar el comando.').catch(() => {});
    }
  },
};
