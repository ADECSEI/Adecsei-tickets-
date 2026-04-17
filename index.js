require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.commands = new Collection();
client.openTickets = new Map();
client.pendingForms = new Map();

// --- Cargar eventos ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// --- Cargar comandos ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name) client.commands.set(command.name, command);
}

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ ERROR: DISCORD_BOT_TOKEN no está configurado en el archivo .env');
  process.exit(1);
}

client.login(token).catch(err => {
  if (err.message?.includes('disallowed intents')) {
    console.error('❌ Intents privilegiados NO activados. Ve a:');
    console.error('   https://discord.com/developers/applications');
    console.error('   → Tu aplicación → Bot → Activa SERVER MEMBERS INTENT y MESSAGE CONTENT INTENT');
  } else {
    console.error('❌ Error al conectar:', err.message);
  }
  process.exit(1);
});
