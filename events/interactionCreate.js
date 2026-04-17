const { Events } = require('discord.js');
const {
  handleSelectMenu,
  handleButtonInteraction,
  handleModalSubmit,
  handleCloseTicket,
} = require('../commands/tickets.js');

const TICKET_SELECT_IDS = [
  'ticket_select_adecsei',
  'ticket_select_duende',
  'ticket_select_oposiciones',
  'ticket_select_criminal',
];

const TICKET_BUTTON_IDS = ['ticket_btn_soporte', 'ticket_btn_pedidos'];

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    try {
      if (interaction.isStringSelectMenu()) {
        if (TICKET_SELECT_IDS.includes(interaction.customId)) {
          await handleSelectMenu(interaction, client);
          return;
        }
      }

      if (interaction.isButton()) {
        if (TICKET_BUTTON_IDS.includes(interaction.customId)) {
          await handleButtonInteraction(interaction, client);
          return;
        }
        if (interaction.customId.startsWith('close_ticket_')) {
          await handleCloseTicket(interaction, client);
          return;
        }
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('ticket_form_')) {
          await handleModalSubmit(interaction, client);
          return;
        }
      }
    } catch (err) {
      console.error('Error en interacción:', err);
      try {
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Ocurrió un error. Inténtalo de nuevo.', ephemeral: true });
        }
      } catch {}
    }
  },
};
