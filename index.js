require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot encendido como ${client.user.tag}`);
});

const token = process.env.TOKEN;

if (!token) {
  console.error('❌ ERROR: No se encontró DISCORD_BOT_TOKEN');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('❌ Error al iniciar el bot:', err.message);
});