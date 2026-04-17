
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const config = require('../config.json');

function buildSelectEmbed(title, description, options, customId) {
  const embed = new EmbedBuilder()
    .setColor(0x2b0033)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: '✦ ADECSEI GROUP ✦' })
    .setTimestamp();

  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder('Selecciona una opción...')
    .addOptions(
      options.map(o =>
        new StringSelectMenuOptionBuilder()
          .setLabel(o.label)
          .setValue(o.value)
          .setEmoji(o.emoji)
          .setDescription(o.description || '')
      )
    );

  const row = new ActionRowBuilder().addComponents(menu);
  return { embed, row };
}

function buildButtonEmbed(title, description, buttonLabel, customId) {
  const embed = new EmbedBuilder()
    .setColor(0x2b0033)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: '✦ ADECSEI GROUP ✦' })
    .setTimestamp();

  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(buttonLabel)
    .setEmoji('🎫')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);
  return { embed, row };
}

async function sendSystem(guild, system) {
  switch (system) {
    case 'adecsei': {
      const ch = guild.channels.cache.get(config.ticketChannels.ADECSEI_MAIN);
      if (!ch) { console.log('⚠️  Canal ADECSEI_MAIN no encontrado'); return; }
      const { embed, row } = buildSelectEmbed(
        '🧳 ADECSEI GROUP — Sistema de Tickets',
        'Bienvenido al sistema profesional de atención.\n\nSeleccione la opción que corresponda a su solicitud:\n\n🛒 **Pedido de Servicio**\n💬 **Soporte / Dudas**\n💰 **Pagos**\n🐛 **Reporte de Error**\n\nNuestro equipo lo atenderá a la brevedad.',
        [
          { label: 'Pedido de Servicio', value: 'adecsei_pedido', emoji: '🛒', description: 'Solicitar un servicio o producto' },
          { label: 'Soporte / Dudas', value: 'adecsei_soporte', emoji: '💬', description: 'Consultas y dudas generales' },
          { label: 'Pagos', value: 'adecsei_pagos', emoji: '💰', description: 'Consultas sobre pagos' },
          { label: 'Reporte de Error', value: 'adecsei_bug', emoji: '🐛', description: 'Reportar un error o fallo' },
        ],
        'ticket_select_adecsei'
      );
      await ch.send({ embeds: [embed], components: [row] });
      console.log('✅ Embed ADECSEI enviado');
      break;
    }
    case 'duende': {
      const ch = guild.channels.cache.get(config.ticketChannels.DUENDE_SOPORTE);
      if (!ch) { console.log('⚠️  Canal DUENDE_SOPORTE no encontrado'); return; }
      const { embed, row } = buildSelectEmbed(
        '🔧 Sistema de Soporte Oficial — EL DUENDE RP',
        '💬 **Bienvenido al sistema de soporte oficial de EL DUENDE RP.**\n\nSeleccione la opción correspondiente a su solicitud de soporte:\n\n🔧 **Problemas en el servidor**\n✨ **Problemas de rol o cuenta**\n💻 **Soporte técnico**\n📌 **Dudas generales**\n\nNuestro equipo revisará su caso a la brevedad.\n\nPara otros tipos de cosas, bugs, etc.... ven al apartado 🧳 #abrir-pedido',
        [
          { label: 'Problemas en el servidor', value: 'duende_servidor', emoji: '🔧', description: 'Fallos o errores del servidor' },
          { label: 'Problemas de rol o cuenta', value: 'duende_rol', emoji: '✨', description: 'Problemas con tu personaje o cuenta' },
          { label: 'Soporte técnico', value: 'duende_tecnico', emoji: '💻', description: 'Soporte técnico general' },
          { label: 'Dudas generales', value: 'duende_dudas', emoji: '📌', description: 'Consultas y preguntas generales' },
        ],
        'ticket_select_duende'
      );
      await ch.send({ embeds: [embed], components: [row] });
      console.log('✅ Embed DUENDE enviado');
      break;
    }
    case 'oposiciones': {
      const ch = guild.channels.cache.get(config.ticketChannels.OPOSICIONES);
      if (!ch) { console.log('⚠️  Canal OPOSICIONES no encontrado'); return; }
      const { embed, row } = buildSelectEmbed(
        '🧳 Sistema de Soporte Profesional — Oposiciones',
        '🧳 **Bienvenido al sistema de soporte profesional de Oposiciones.**\n\nSeleccione la opción correspondiente a su consulta:\n\n📝 **Temarios**\n📅 **Fechas y convocatorias**\n📚 **Recursos de estudio**\n❓ **Dudas generales**\n\n⚠️ Se responderán únicamente oposiciones abiertas.\nTodos los usuarios que abran un ticket recibirán atención profesional. 🎫',
        [
          { label: 'Temarios', value: 'opos_temarios', emoji: '📝', description: 'Consultas sobre temarios' },
          { label: 'Fechas y convocatorias', value: 'opos_fechas', emoji: '📅', description: 'Información sobre convocatorias' },
          { label: 'Recursos de estudio', value: 'opos_recursos', emoji: '📚', description: 'Material y recursos de estudio' },
          { label: 'Dudas generales', value: 'opos_dudas', emoji: '❓', description: 'Preguntas generales' },
        ],
        'ticket_select_oposiciones'
      );
      await ch.send({ embeds: [embed], components: [row] });
      console.log('✅ Embed OPOSICIONES enviado');
      break;
    }
    case 'criminal': {
      const ch = guild.channels.cache.get(config.ticketChannels.CONSEJO_CRIMINAL);
      if (!ch) { console.log('⚠️  Canal CONSEJO_CRIMINAL no encontrado'); return; }
      const { embed, row } = buildSelectEmbed(
        '🔫 Apertura de Caso',
        'Bienvenido/a al apartado de Consejo Criminal de El Duende RP.\n\nSi necesitas asesoramiento o tienes dudas relacionadas con actividades criminales dentro del rol (robos, secuestros, bandas, negocios ilegales, normas del rol criminal, etc.), abre un ticket en este apartado y explica tu situación con detalle.\n\n🔹 Explica claramente tu duda o problema.\n🔹 Indica tu nombre dentro del servidor.\n🔹 Proporciona toda la información necesaria para poder ayudarte.\n🔹 Espera la respuesta del staff antes de realizar cualquier acción en rol.\n\nUn miembro del equipo criminal te atenderá lo antes posible. 🚨',
        [
          { label: 'Soporte Jugador', value: 'criminal_soporte', emoji: '👤', description: 'Soporte general para jugadores' },
          { label: 'Reportar Jugador', value: 'criminal_reporte', emoji: '🚨', description: 'Reportar a un jugador' },
          { label: 'Soporte Facciones', value: 'criminal_facciones', emoji: '🏴', description: 'Soporte para facciones criminales' },
        ],
        'ticket_select_criminal'
      );
      await ch.send({ embeds: [embed], components: [row] });
      console.log('✅ Embed CRIMINAL enviado');
      break;
    }
    case 'soporte': {
      const ch = guild.channels.cache.get(config.ticketChannels.ADECSEI_SOPORTE_PEDIDOS);
      if (!ch) { console.log('⚠️  Canal ADECSEI_SOPORTE_PEDIDOS no encontrado'); return; }
      const { embed, row } = buildButtonEmbed(
        '💎 SOPORTE – ADECSEI',
        'Este canal es para abrir un ticket de soporte.\n\n─────────────── ♦️ ───────────────\n\n💬 Para cualquier duda, problema o consulta general sobre nuestros servicios o el servidor.\n\n🧠 Nuestro equipo te ayudará de forma clara, rápida y profesional.\n\n⚡ Intentamos responder lo antes posible para darte una solución.\n\n📌 Por favor, explica tu situación con el mayor detalle posible para poder ayudarte mejor.\n\n❓ Puedes preguntar sobre pedidos, servicios o funcionamiento del servidor.\n\n─────────────── ♦️ ───────────────\n\n🤝 Estamos aquí para ayudarte en todo momento.',
        'CREAR TICKET',
        'ticket_btn_soporte'
      );
      await ch.send({ embeds: [embed], components: [row] });
      console.log('✅ Embed SOPORTE enviado');
      break;
    }
    case 'pedidos': {
      const ch = guild.channels.cache.get(config.ticketChannels.ADECSEI_SOPORTE_PEDIDOS);
      if (!ch) { console.log('⚠️  Canal ADECSEI_SOPORTE_PEDIDOS no encontrado'); return; }
      const { embed, row } = buildButtonEmbed(
        '💎 TICKET DE PEDIDOS – ADECSEI',
        'Abre un ticket para realizar un pedido personalizado.\n\n─────────────── ♦️ ───────────────\n\n🛒 En este canal puedes solicitar cualquier servicio de ADECSEI:\n🌐 Páginas web\n🖥️ Servidores\n🎨 Diseño gráfico\n👕 Ropa personalizada\n🤖 Aplicaciones\n💡 Y mucho más — programación, diseño y cualquier proyecto a medida.\n\n💼 Todos los servicios son de pago y se realizan de forma profesional y personalizada.\n\n🎯 Es importante que expliques con claridad lo que necesitas para poder darte el mejor resultado posible.\n\n─────────────── ♦️ ───────────────\n\n📌 Usa este formato al abrir tu ticket:\n```\nServicio:\nDescripción:\nPresupuesto:\nTiempo deseado:\n```\n\n⚡ Nuestro equipo revisará tu solicitud y te responderá lo antes posible.\n\n🤝 Gracias por confiar en ADECSEI.',
        'CREAR TICKET',
        'ticket_btn_pedidos'
      );
      await ch.send({ embeds: [embed], components: [row] });
      console.log('✅ Embed PEDIDOS enviado');
      break;
    }
    default:
      console.log(`⚠️  Sistema desconocido: ${system}`);
  }
}

module.exports = {
  name: 'setup',
  description: 'Envía los embeds de tickets a los canales configurados (solo administradores)',
  async execute(message, args, client) {
    if (!message.guild) return;

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Necesitas ser administrador para usar este comando.');
    }

    const sistemas = args.length > 0
      ? args.map(a => a.toLowerCase())
      : ['adecsei', 'duende', 'oposiciones', 'criminal', 'soporte', 'pedidos'];

    const confirmMsg = await message.reply(`⏳ Enviando sistemas: **${sistemas.join(', ')}**...`);

    for (const sistema of sistemas) {
      await sendSystem(message.guild, sistema);
    }

    await confirmMsg.edit(`✅ Sistemas de tickets configurados: **${sistemas.join(', ')}**`);
  },
};
