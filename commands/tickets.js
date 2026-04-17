
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const config = require('../config.json');

const SELECT_TO_TYPE = {
  ticket_select_adecsei: {
    adecsei_pedido: 'Pedido de Servicio',
    adecsei_soporte: 'Soporte / Dudas',
    adecsei_pagos: 'Pagos',
    adecsei_bug: 'Reporte de Error',
  },
  ticket_select_duende: {
    duende_servidor: 'Problemas en el servidor',
    duende_rol: 'Problemas de rol o cuenta',
    duende_tecnico: 'Soporte técnico',
    duende_dudas: 'Dudas generales',
  },
  ticket_select_oposiciones: {
    opos_temarios: 'Temarios',
    opos_fechas: 'Fechas y convocatorias',
    opos_recursos: 'Recursos de estudio',
    opos_dudas: 'Dudas generales',
  },
  ticket_select_criminal: {
    criminal_soporte: 'Soporte Jugador',
    criminal_reporte: 'Reportar Jugador',
    criminal_facciones: 'Soporte Facciones',
  },
};

const BUTTON_TO_TYPE = {
  ticket_btn_soporte: 'Soporte General',
  ticket_btn_pedidos: 'Pedido de Servicio',
};

const CATEGORY_KEYWORDS = {
  bug: ['bug', 'error', 'reporte', 'fallo', 'soporte técnico', 'técnico'],
  soporte: ['soporte', 'duda', 'ayuda', 'dudas generales'],
  pedidos: ['pedido', 'servicio', 'pago', 'pagos'],
  criminal: ['criminal', 'soporte jugador', 'soporte facciones', 'reportar jugador'],
  oposicion: ['temario', 'fecha', 'convocatoria', 'estudio'],
  rol: ['rol', 'cuenta', 'personaje'],
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
}

function getUrgencyColor(urgencia) {
  return config.urgencyColors[urgencia] ?? config.urgencyColors.MEDIO;
}

async function findCategory(guild, type, titulo) {
  const search = (type + ' ' + titulo).toLowerCase();
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
  for (const [, cat] of categories) {
    const catName = cat.name.toLowerCase();
    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => search.includes(kw) || catName.includes(kw) || catName.includes(key))) {
        return cat;
      }
    }
  }
  return null;
}

function buildTicketModal(prefix) {
  const modal = new ModalBuilder()
    .setCustomId(`ticket_form_${prefix}`)
    .setTitle('📋 Formulario de Ticket');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('titulo')
        .setLabel('Título de la razón')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Escribe un título breve para tu solicitud...')
        .setRequired(true)
        .setMaxLength(100)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('descripcion')
        .setLabel('Describe el problema')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Explica tu situación con detalle...')
        .setRequired(true)
        .setMaxLength(1000)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('pruebas')
        .setLabel('¿Tienes pruebas? (videos, capturas...)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Sí / No — describe brevemente cuáles')
        .setRequired(false)
        .setMaxLength(200)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('recompensa')
        .setLabel('¿Recompensa IC / recuperar algo?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Describe si buscas recompensa o recuperar algo IC')
        .setRequired(false)
        .setMaxLength(200)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('urgencia')
        .setLabel('Urgencia: BAJO / MEDIO / ALTO')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Escribe BAJO, MEDIO o ALTO')
        .setRequired(true)
        .setMaxLength(5)
    )
  );

  return modal;
}

async function handleSelectMenu(interaction, client) {
  const typeMap = SELECT_TO_TYPE[interaction.customId];
  const ticketType = typeMap?.[interaction.values[0]] ?? interaction.values[0];
  client.pendingForms.set(`${interaction.user.id}_type`, ticketType);
  client.pendingForms.set(`${interaction.user.id}_prefix`, interaction.values[0]);
  await interaction.showModal(buildTicketModal(interaction.values[0]));
}

async function handleButtonInteraction(interaction, client) {
  const ticketType = BUTTON_TO_TYPE[interaction.customId] ?? interaction.customId;
  client.pendingForms.set(`${interaction.user.id}_type`, ticketType);
  client.pendingForms.set(`${interaction.user.id}_prefix`, interaction.customId);
  await interaction.showModal(buildTicketModal(interaction.customId));
}

async function handleModalSubmit(interaction, client) {
  if (!interaction.guild || !interaction.member) return;

  const prefix = interaction.customId.replace('ticket_form_', '');
  const userId = interaction.user.id;
  const ticketType = client.pendingForms.get(`${userId}_type`) ?? BUTTON_TO_TYPE[prefix] ?? prefix;
  client.pendingForms.delete(`${userId}_type`);
  client.pendingForms.delete(`${userId}_prefix`);

  const titulo     = interaction.fields.getTextInputValue('titulo');
  const descripcion = interaction.fields.getTextInputValue('descripcion');
  const pruebas    = interaction.fields.getTextInputValue('pruebas') || 'No';
  const recompensa = interaction.fields.getTextInputValue('recompensa') || 'No';
  const urgenciaRaw = interaction.fields.getTextInputValue('urgencia').toUpperCase().trim();
  const urgencia   = ['BAJO', 'MEDIO', 'ALTO'].includes(urgenciaRaw) ? urgenciaRaw : 'MEDIO';

  const username    = interaction.member.user.username;
  const channelName = `${slugify(titulo)}-${slugify(username)}`;
  const closeRole   = config.closeRoles[interaction.guild.id];
  const category    = await findCategory(interaction.guild, ticketType, titulo);

  await interaction.deferReply({ ephemeral: true });

  try {
    const permissionOverwrites = [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: interaction.member.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      },
    ];

    if (closeRole) {
      permissionOverwrites.push({
        id: closeRole,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels],
      });
    }

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category?.id,
      permissionOverwrites,
    });

    const urgencyEmoji = urgencia === 'BAJO' ? '🟢' : urgencia === 'MEDIO' ? '🟣' : '🔴';

    const ticketEmbed = new EmbedBuilder()
      .setColor(getUrgencyColor(urgencia))
      .setTitle(`🎫 Ticket: ${titulo}`)
      .addFields(
        { name: '👤 Usuario',               value: `<@${interaction.member.user.id}>`, inline: true },
        { name: '📂 Tipo',                  value: ticketType,                          inline: true },
        { name: `${urgencyEmoji} Urgencia`, value: urgencia,                            inline: true },
        { name: '📝 Descripción',           value: descripcion,                         inline: false },
        { name: '🎥 Pruebas',              value: pruebas,                             inline: true },
        { name: '💰 Recompensa / IC',      value: recompensa,                          inline: true }
      )
      .setFooter({ text: `✦ ADECSEI GROUP ✦ • ID: ${interaction.member.user.id}` })
      .setTimestamp();

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`close_ticket_${channel.id}`)
        .setLabel('🔒 Cerrar Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${interaction.member.user.id}>`,
      embeds: [ticketEmbed],
      components: [closeRow],
    });

    client.openTickets.set(channel.id, {
      serverId: interaction.guild.id,
      userId: interaction.member.user.id,
      username,
      type: ticketType,
      titulo,
      urgencia,
      channelId: channel.id,
      openedAt: new Date(),
    });

    await interaction.editReply({ content: `✅ Tu ticket ha sido creado: <#${channel.id}>` });
  } catch (err) {
    console.error('Error creando ticket:', err);
    await interaction.editReply({ content: '❌ Hubo un error al crear el ticket. Contacta a un administrador.' });
  }
}

async function handleCloseTicket(interaction, client) {
  if (!interaction.guild || !interaction.member) return;

  const closeRole = config.closeRoles[interaction.guild.id];
  if (!closeRole || !interaction.member.roles.cache.has(closeRole)) {
    return interaction.reply({ content: '❌ No tienes permisos para cerrar este ticket.', ephemeral: true });
  }

  const channelId = interaction.channel?.id;
  if (!channelId) return;

  const ticketData           = client.openTickets.get(channelId);
  const transcriptChannelId  = config.transcriptChannels[interaction.guild.id];

  await interaction.reply({ content: '🔒 Cerrando ticket y generando transcripción...', ephemeral: false });

  if (transcriptChannelId && ticketData) {
    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const transcript = [...messages.values()]
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map(m => `[${m.createdAt.toLocaleString('es-ES')}] ${m.author.tag}: ${m.content}`)
        .join('\n');

      const transcriptChannel = interaction.guild.channels.cache.get(transcriptChannelId);
      if (transcriptChannel) {
        await transcriptChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2b0033)
              .setTitle(`📄 Transcripción — ${ticketData.titulo}`)
              .addFields(
                { name: '👤 Abierto por',  value: `<@${ticketData.userId}> (\`${ticketData.username}\`)`, inline: true },
                { name: '📂 Tipo',         value: ticketData.type,                                          inline: true },
                { name: '⚠️ Urgencia',    value: ticketData.urgencia,                                      inline: true },
                { name: '🕐 Abierto el',  value: ticketData.openedAt.toLocaleString('es-ES'),              inline: true },
                { name: '🔒 Cerrado por', value: `<@${interaction.member.user.id}>`,                       inline: true }
              )
              .setFooter({ text: '✦ ADECSEI GROUP ✦' })
              .setTimestamp()
          ],
          files: [{
            attachment: Buffer.from(transcript || 'Sin mensajes', 'utf-8'),
            name: `transcript-${ticketData.titulo.replace(/\s+/g, '-')}.txt`,
          }],
        });
      }
    } catch (err) {
      console.error('Error enviando transcripción:', err);
    }
  }

  client.openTickets.delete(channelId);
  setTimeout(async () => { try { await interaction.channel?.delete(); } catch {} }, 3000);
}

module.exports = {
  name: 'tickets',
  handleSelectMenu,
  handleButtonInteraction,
  handleModalSubmit,
  handleCloseTicket,
};
