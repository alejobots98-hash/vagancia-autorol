
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

// ==============================
// CONFIGURACIÓN DEL BOT
// ==============================

const ROLE_ID = "1469148560489582694";
const CLIENT_ID = "1496661078619459615";
const GUILD_ID = "1211757600379772939";

if (!process.env.TOKEN) {
  throw new Error("Falta TOKEN en el archivo .env");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// 🥤 ENCONTRÁ LA BOLITA
// ==============================

const bolitaGames = new Map();
const bolitaPlayers = new Map();

function crearBotonesDesafioBolita() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("bolita_accept")
        .setLabel("Aceptar desafío")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("bolita_decline")
        .setLabel("Rechazar")
        .setStyle(ButtonStyle.Danger)
    )
  ];
}

function crearBotonesVasos(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("bolita_pick_0")
        .setLabel("🥤 Vaso 1")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId("bolita_pick_1")
        .setLabel("🥤 Vaso 2")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId("bolita_pick_2")
        .setLabel("🥤 Vaso 3")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled)
    )
  ];
}

// ==============================
// ⚡ SISTEMA DE AURA
// ==============================

const auraStats = new Map();
const auraDuels = new Map();

function obtenerStatsAura(userId) {
  if (!auraStats.has(userId)) {
    auraStats.set(userId, {
      victorias: 0,
      derrotas: 0,
      empates: 0,
      duelos: 0,
      auraTotal: 0
    });
  }

  return auraStats.get(userId);
}

function generarAura() {
  const rand = Math.random();

  let cantidad, categoria, comentario, color;

  if (rand < 0.10) {
    cantidad = Math.floor(Math.random() * 2001) - 1000;
    categoria = "💀 AURA INEXISTENTE";
    comentario = "Ni su propia sombra quiere acompañarlo.";
    color = 0xE74C3C;

  } else if (rand < 0.25) {
    cantidad = Math.random() * 10;
    categoria = "🥔 NPC";
    comentario = "Tiene menos presencia que un tutorial sin sonido.";
    color = 0x95A5A6;

  } else if (rand < 0.45) {
    cantidad = Math.random() * 100;
    categoria = "🪦 SIN AURA";
    comentario = "Su aura se fue a comprar pan y nunca volvió.";
    color = 0xE67E22;

  } else if (rand < 0.70) {
    cantidad = Math.random() * 1000;
    categoria = "⚡ AURA NORMAL";
    comentario = "Tiene una presencia bastante decente.";
    color = 0xF1C40F;

  } else if (rand < 0.85) {
    cantidad = Math.random() * 10000;
    categoria = "🔥 AURA LEGENDARIA";
    comentario = "Su presencia hace temblar a los NPC.";
    color = 0x2ECC71;

  } else if (rand < 0.94) {
    cantidad = Math.random() * 100000;
    categoria = "👑 AURA DIVINA";
    comentario = "Hasta los dioses le tienen respeto.";
    color = 0x3498DB;

  } else if (rand < 0.99) {
    cantidad = Math.random() * 1000000;
    categoria = "🌌 AURA CÓSMICA";
    comentario = "Su aura fue detectada desde otra galaxia.";
    color = 0x9B59B6;

  } else {
    cantidad = Math.random() * 100000000;
    categoria = "💎 ENTIDAD IMPOSIBLE";
    comentario = "ROMPIÓ EL MEDIDOR. EL UNIVERSO NO PUEDE CONTENER TANTA AURA.";
    color = 0xE91E63;
  }

  return {
    cantidad: Math.floor(cantidad * 100) / 100,
    categoria,
    comentario,
    color
  };
}

function formatearAura(numero) {
  return numero.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// ==============================
// 💬 FRASES DE AURA
// ==============================

const frasesGanador = [
  "Tiene tanta aura que el universo gira alrededor suyo.",
  "Su presencia genera respeto hasta en los objetos.",
  "El mismísimo creador le pidió un autógrafo.",
  "Tiene más aura que todos los usuarios del servidor juntos.",
  "Su aura fue detectada desde otra galaxia.",
  "Discord le pidió permiso para existir.",
  "Es tan legendario que los NPC se arrodillan.",
  "Su aura no tiene límites. El medidor explotó.",
  "Nació con más aura de la que el otro tendrá en 10 vidas."
];

const frasesPerdedor = [
  "Tiene menos aura que una piedra mojada.",
  "Su aura está en números negativos.",
  "Ni su sombra quiere acompañarlo.",
  "Tiene menos presencia que un NPC sin texturas.",
  "Su aura se fue a comprar pan y nunca volvió.",
  "El medidor detectó una presencia inexistente.",
  "Hasta una papa hervida tiene más aura.",
  "Discord está considerando eliminar su existencia.",
  "Su aura fue desconectada por falta de actividad.",
  "Debe aura al universo.",
  "El vacío tiene más personalidad."
];

const frasesEmpate = [
  "Dos NPC peleando por quién tiene menos aura.",
  "Duelo cancelado: ninguno de los dos tiene presencia.",
  "El medidor no sabe a quién humillar primero.",
  "Ambos necesitan actualizar su existencia.",
  "Ni siquiera el universo quiere decidir.",
  "Dos leyendas... pero de la falta de aura."
];

function fraseAleatoria(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ==============================
// ⚡ GENERAR RESULTADO DEL DUELO
// ==============================

function crearResultadoAura(jugador1, jugador2) {
  const aura1 = generarAura();
  const aura2 = generarAura();

  const stats1 = obtenerStatsAura(jugador1.id);
  const stats2 = obtenerStatsAura(jugador2.id);

  stats1.duelos++;
  stats2.duelos++;

  stats1.auraTotal += aura1.cantidad;
  stats2.auraTotal += aura2.cantidad;

  let resultado;
  let fraseFinal;
  let colorFinal;

  if (aura1.cantidad > aura2.cantidad) {
    stats1.victorias++;
    stats2.derrotas++;

    resultado = `🏆 ¡<@${jugador1.id}> GANÓ LA BATALLA!`;

    fraseFinal =
      `👑 **${fraseAleatoria(frasesGanador)}**\n\n` +
      `💀 **${fraseAleatoria(frasesPerdedor)}**`;

    colorFinal = 0x2ECC71;

  } else if (aura2.cantidad > aura1.cantidad) {
    stats2.victorias++;
    stats1.derrotas++;

    resultado = `🏆 ¡<@${jugador2.id}> GANÓ LA BATALLA!`;

    fraseFinal =
      `👑 **${fraseAleatoria(frasesGanador)}**\n\n` +
      `💀 **${fraseAleatoria(frasesPerdedor)}**`;

    colorFinal = 0x2ECC71;

  } else {
    stats1.empates++;
    stats2.empates++;

    resultado = "🤝 ¡EMPATE!";

    fraseFinal = `😂 **${fraseAleatoria(frasesEmpate)}**`;

    colorFinal = 0xF1C40F;
  }

  const embed = new EmbedBuilder()
    .setColor(colorFinal)
    .setTitle("⚡ BATALLA DE AURA")
    .setDescription(
      `**${jugador1.username}** VS **${jugador2.username}**\n\n` +
      "⚔️ ¡El duelo de aura ha terminado!"
    )
    .addFields(
      {
        name: `👤 ${jugador1.username}`,
        value:
          `**${formatearAura(aura1.cantidad)}** de aura\n` +
          `${aura1.categoria}\n` +
          `_${aura1.comentario}_`,
        inline: true
      },
      {
        name: `👤 ${jugador2.username}`,
        value:
          `**${formatearAura(aura2.cantidad)}** de aura\n` +
          `${aura2.categoria}\n` +
          `_${aura2.comentario}_`,
        inline: true
      },
      {
        name: "🏆 RESULTADO",
        value: resultado
      },
      {
        name: "💬 VEREDICTO DEL MEDIDOR",
        value: fraseFinal
      },
      {
        name: "📊 ESTADÍSTICAS",
        value:
          `**${jugador1.username}:**\n` +
          `🏆 Victorias: ${stats1.victorias}\n` +
          `💀 Derrotas: ${stats1.derrotas}\n` +
          `🤝 Empates: ${stats1.empates}\n` +
          `⚔️ Duelos: ${stats1.duelos}\n\n` +
          `**${jugador2.username}:**\n` +
          `🏆 Victorias: ${stats2.victorias}\n` +
          `💀 Derrotas: ${stats2.derrotas}\n` +
          `🤝 Empates: ${stats2.empates}\n` +
          `⚔️ Duelos: ${stats2.duelos}`
      }
    )
    .setFooter({
      text: "LA VAGANCIA • Sistema de aura aleatorio"
    })
    .setTimestamp();

  return embed;
}

// ==============================
// COMANDOS SLASH
// ==============================

const commands = [
  new SlashCommandBuilder()
    .setName("apos")
    .setDescription("Obtener rol de apostador"),

  new SlashCommandBuilder()
    .setName("aura")
    .setDescription("Desafiá a alguien a una batalla de aura")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("La persona a la que querés desafiar")
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" })
  .setToken(process.env.TOKEN);

// ==============================
// ✈️ AVIONCITO
// ==============================

function generarAvioncito() {
  const rand = Math.random() * 100;

  let distancia, titulo, comentario, color;

  if (rand < 25) {
    distancia = Math.random() * (2.00 - 0.10) + 0.10;
    titulo = "💥 ¡DESASTRE AERODINÁMICO!";
    comentario =
      "Se estrelló contra la mesa apenas rozó el aire. Ni un plomo de pesca caía tan rápido.";
    color = 0xE74C3C;

  } else if (rand < 60) {
    distancia = Math.random() * (50.00 - 2.01) + 2.01;
    titulo = "🍃 VUELO DOMÉSTICO";
    comentario =
      "Un vuelo modesto pero digno. Se clavó justo al lado del bote de basura.";
    color = 0xE67E22;

  } else if (rand < 85) {
    distancia = Math.random() * (500.00 - 50.01) + 50.01;
    titulo = "✈️ PLANEADOR EXPERTO";
    comentario =
      "¡Impresionante! Agarró una corriente térmica y cruzó varias manzanas antes de tocar tierra.";
    color = 0xF1C40F;

  } else if (rand < 95) {
    distancia = Math.random() * (10000.00 - 500.01) + 500.01;
    titulo = "🚀 TURBINA SUPERSÓNICA";
    comentario =
      "¡Cruzó la ciudad entera! Superó la altura de los edificios y casi se lo traga la turbina de un Boeing 747.";
    color = 0x2ECC71;

  } else if (rand < 99) {
    distancia = Math.random() * (1000000.00 - 10000.01) + 10000.01;
    titulo = "🌌 ÓRBITA ESTRATOSFÉRICA";
    comentario =
      "Rompió la barrera del sonido, cruzó la estratósfera y rozó la Estación Espacial Internacional.";
    color = 0x3498DB;

  } else {
    distancia = Math.random() * (40075000.00 - 1000001.00) + 1000001.00;
    titulo = "🪐 VIAJERO INTERGALÁCTICO";
    comentario =
      "¡DESAFÍA TODAS LAS LEYES DE LA FÍSICA! Le dio la vuelta completa al planeta Tierra y sigue flotando en el vacío exterior.";
    color = 0x9B59B6;
  }

  return { distancia, titulo, comentario, color };
}

function formatearDistancia(metros) {
  if (metros >= 1000) {
    const km = metros / 1000;

    const kmStr = km.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const mStr = metros.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${kmStr} km (${mStr} m)`;
  }

  return `${metros.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} metros`;
}

// ==============================
// ⚽ FUTBOL: JUEGUITOS
// ==============================

function generarFutbol() {
  const jueguitos = Math.floor(Math.random() * 100) + 1;

  let titulo, comentario, color;

  if (jueguitos <= 5) {
    titulo = "💀 ¡PIERNAS DE MADERA!";
    comentario =
      "La pelota tocó el piso antes de que pudiera acomodarse.";
    color = 0xE74C3C;

  } else if (jueguitos <= 15) {
    titulo = "🥴 FUTBOLISTA DE POTRERO";
    comentario =
      "Unos toques y se le escapó la pelota. ¡A practicar!";
    color = 0xE67E22;

  } else if (jueguitos <= 35) {
    titulo = "⚽ BUEN DOMINIO";
    comentario =
      "Tiene buen control. Ya se puede armar un partidito.";
    color = 0xF1C40F;

  } else if (jueguitos <= 60) {
    titulo = "🔥 CRACK DEL BARRIO";
    comentario =
      "La pelota parece pegada al pie. ¡Qué calidad!";
    color = 0x2ECC71;

  } else if (jueguitos <= 85) {
    titulo = "🐐 NIVEL LEYENDA";
    comentario =
      "¡Una máquina! Los defensores ya están pidiendo el cambio.";
    color = 0x3498DB;

  } else {
    titulo = "👑 REY DE LOS JUEGUITOS";
    comentario =
      "¡Una locura! Puede seguir hasta que apaguen las luces del estadio.";
    color = 0x9B59B6;
  }

  return { jueguitos, titulo, comentario, color };
}

// ==============================
// 🥅 PENAL (50% GOL / 50% FALLO)
// ==============================

function generarPenal() {
  const lados = ["izquierda", "centro", "derecha"];
  const ladoPateado = lados[Math.floor(Math.random() * lados.length)];

  const gol = Math.random() < 0.5;

  let ladoArquero, titulo, comentario, color, movimientoArquero;

  if (gol) {
    titulo = "⚽ ¡GOOOOOOL!";
    color = 0x2ECC71;

    const coincidaLado = Math.random() < 0.3;

    ladoArquero = coincidaLado
      ? ladoPateado
      : lados.filter(l => l !== ladoPateado)[
          Math.floor(Math.random() * 2)
        ];

    if (ladoArquero !== ladoPateado) {
      movimientoArquero =
        `Se tiró a la **${ladoArquero}**, pero la pelota fue a la **${ladoPateado}**.`;
      comentario =
        "¡Lo engañó por completo! El arquero quedó pagando.";
    } else {
      movimientoArquero =
        `Se tiró a la **${ladoArquero}**, pero no pudo detener el disparo.`;
      comentario =
        "¡Le ganó con un remate potente! La pelota terminó adentro.";
    }

  } else {
    titulo = "🧤 ¡NO HAY GOL!";
    color = 0xE74C3C;

    const fueAtajado = Math.random() < 0.7;

    if (fueAtajado) {
      ladoArquero = ladoPateado;
      movimientoArquero =
        `Se tiró a la **${ladoArquero}** y adivinó el remate.`;
      comentario =
        "¡Atajadón del arquero! Se quedó con la pelota y salvó a su equipo.";
    } else {
      ladoArquero = lados[Math.floor(Math.random() * lados.length)];
      movimientoArquero =
        `El arquero se tiró a la **${ladoArquero}**.`;
      comentario =
        "¡El remate se fue completamente desviado por arriba del travesaño!";
    }
  }

  return {
    ladoPateado,
    movimientoArquero,
    gol,
    titulo,
    comentario,
    color
  };
}

// ==============================
// 🚀 BOT LISTO
// ==============================

client.once(Events.ClientReady, async () => {
  console.log(`Bot listo como ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Comandos slash registrados correctamente.");
  } catch (error) {
    console.error("Error al registrar comandos slash:", error);
  }
});

// ==============================
// 📌 COMANDOS CON PREFIJO
// ==============================

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const comando = message.content.toLowerCase().trim();

  const nombreUsuario =
    message.member?.displayName || message.author.username;

  try {
    // ✈️ AVIONCITO
    if (comando === ".avioncito") {
      const {
        distancia,
        titulo,
        comentario,
        color
      } = generarAvioncito();

      const distanciaTexto = formatearDistancia(distancia);

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`✈️ ${titulo}`)
        .setDescription(
          `**${nombreUsuario}** lanzó su avioncito de papel.`
        )
        .addFields(
          {
            name: "📏 Distancia recorrida",
            value: `\`\`\`\n${distanciaTexto}\n\`\`\``
          },
          {
            name: "📝 Resultado",
            value: comentario
          }
        );

      return await message.channel.send({
        embeds: [embed]
      });
    }

    // 🥤 ENCONTRÁ LA BOLITA
    if (comando.startsWith(".bolita")) {
      const rival = message.mentions.users.first();

      if (!rival) {
        return message.reply(
          "🥤 Usá el comando así: `.bolita @rival`"
        );
      }

      if (rival.id === message.author.id) {
        return message.reply(
          "😅 No podés desafiarte a vos mismo."
        );
      }

      if (rival.bot) {
        return message.reply(
          "🤖 Tenés que desafiar a una persona, no a un bot."
        );
      }

      if (
        bolitaPlayers.has(message.author.id) ||
        bolitaPlayers.has(rival.id)
      ) {
        return message.reply(
          "⏳ Uno de ustedes ya está jugando una partida de bolita."
        );
      }

      const embed = new EmbedBuilder()
        .setColor(0xD4AF37)
        .setTitle("🥤 ¡DESAFÍO: ENCONTRÁ LA BOLITA!")
        .setDescription(
          `**${message.author.username}** desafió a **${rival.username}**.\n\n` +
          "Hay tres vasos y una bolita escondida. Cada jugador elegirá un vaso en secreto.\n" +
          "Quien encuentre la bolita gana esta partida."
        )
        .setFooter({
          text: "LA VAGANCIA • El rival debe aceptar para comenzar"
        });

      const sent = await message.channel.send({
        content: `<@${rival.id}>`,
        embeds: [embed],
        components: crearBotonesDesafioBolita()
      });

      bolitaGames.set(sent.id, {
        phase: "challenge",
        challengerId: message.author.id,
        rivalId: rival.id,
        ball: null,
        choices: {}
      });

      return;
    }

    // ⚽ FUTBOL
    if (comando === ".futbol") {
      const {
        jueguitos,
        titulo,
        comentario,
        color
      } = generarFutbol();

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(titulo)
        .setDescription(
          `⚽ **${nombreUsuario}** se puso a hacer jueguitos con la pelota.`
        )
        .addFields(
          {
            name: "🔢 Jueguitos realizados",
            value: `**${jueguitos}**`,
            inline: true
          },
          {
            name: "🏆 Categoría",
            value: titulo,
            inline: true
          },
          {
            name: "📝 Resultado",
            value: comentario
          }
        )
        .setFooter({
          text: "Desafío de fútbol • Resultado aleatorio"
        });

      return await message.channel.send({
        embeds: [embed]
      });
    }

    // 🥅 PENAL
    if (comando === ".penal") {
      const {
        ladoPateado,
        movimientoArquero,
        gol,
        titulo,
        comentario,
        color
      } = generarPenal();

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(titulo)
        .setDescription(
          `🥅 **${nombreUsuario}** se prepara para patear el penal...`
        )
        .addFields(
          {
            name: "🎯 Dirección del remate",
            value: `La pelota fue a la **${ladoPateado}**.`,
            inline: true
          },
          {
            name: "🧤 Movimiento del arquero",
            value: movimientoArquero,
            inline: true
          },
          {
            name: "📋 Resultado",
            value: `**${gol ? "GOL" : "ERRADO / ATAJADO"}**\n${comentario}`
          }
        )
        .setFooter({
          text: "Penal • Simulación aleatoria"
        });

      return await message.channel.send({
        embeds: [embed]
      });
    }

  } catch (error) {
    console.error("Error al ejecutar comando:", error);

    if (message.channel.isSendable()) {
      await message.channel.send(
        "❌ Hubo un error al ejecutar el comando."
      ).catch(console.error);
    }
  }
});

// ==============================
// 🎯 INTERACCIONES
// ==============================

client.on(Events.InteractionCreate, async interaction => {

  // ==============================
  // ⚡ BOTONES DEL DUELO DE AURA
  // ==============================

  if (
    interaction.isButton() &&
    interaction.customId.startsWith("aura_")
  ) {
    const partes = interaction.customId.split("_");
    const accion = partes[1];
    const idDuelo = partes.slice(2).join("_");

    const duelo = auraDuels.get(idDuelo);

    if (!duelo) {
      return interaction.reply({
        content: "⌛ Este desafío ya no está disponible.",
        ephemeral: true
      });
    }

    // Solo el usuario desafiado puede responder
    if (interaction.user.id !== duelo.rivalId) {
      return interaction.reply({
        content: "❌ ¡Solamente la persona desafiada puede responder!",
        ephemeral: true
      });
    }

    // RECHAZAR
    if (accion === "rechazar") {
      auraDuels.delete(idDuelo);

      return interaction.update({
        content: "❌ El desafío de aura fue rechazado.",
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle("🚫 DESAFÍO RECHAZADO")
            .setDescription(
              `<@${duelo.rivalId}> rechazó el duelo de aura de <@${duelo.desafiadorId}>.`
            )
        ],
        components: []
      });
    }

    // ACEPTAR
    if (accion === "aceptar") {
      auraDuels.delete(idDuelo);

      const jugador1 = await interaction.client.users
        .fetch(duelo.desafiadorId)
        .catch(() => null);

      const jugador2 = interaction.user;

      if (!jugador1) {
        return interaction.update({
          content: "❌ No pude encontrar al jugador que inició el desafío.",
          embeds: [],
          components: []
        });
      }

      const embed = crearResultadoAura(jugador1, jugador2);

      return interaction.update({
        content: `⚡ <@${jugador1.id}> VS <@${jugador2.id}>`,
        embeds: [embed],
        components: []
      });
    }
  }

  // ==============================
  // 🥤 ENCONTRÁ LA BOLITA
  // ==============================

  if (
    interaction.isButton() &&
    interaction.customId.startsWith("bolita_")
  ) {
    const gameId = interaction.message.id;
    const game = bolitaGames.get(gameId);

    if (!game) {
      return interaction.reply({
        content: "⌛ Este desafío ya no está disponible.",
        ephemeral: true
      });
    }

    // ACEPTAR DESAFÍO
    if (interaction.customId === "bolita_accept") {
      if (interaction.user.id !== game.rivalId) {
        return interaction.reply({
          content: "Este desafío es para la persona mencionada.",
          ephemeral: true
        });
      }

      if (game.phase !== "challenge") {
        return interaction.reply({
          content: "Esta partida ya comenzó.",
          ephemeral: true
        });
      }

      if (
        bolitaPlayers.has(game.challengerId) ||
        bolitaPlayers.has(game.rivalId)
      ) {
        bolitaGames.delete(gameId);

        return interaction.update({
          content: "",
          embeds: [
            new EmbedBuilder()
              .setColor(0xE74C3C)
              .setTitle("❌ Desafío cancelado")
              .setDescription(
                "Uno de los jugadores ya está participando en otra partida."
              )
          ],
          components: []
        });
      }

      game.phase = "playing";
      game.ball = Math.floor(Math.random() * 3);
      game.choices = {};

      bolitaPlayers.set(game.challengerId, gameId);
      bolitaPlayers.set(game.rivalId, gameId);

      const jugador1 = await interaction.client.users
        .fetch(game.challengerId)
        .catch(() => null);

      const jugador2 = await interaction.client.users
        .fetch(game.rivalId)
        .catch(() => null);

      const embed = new EmbedBuilder()
        .setColor(0xD4AF37)
        .setTitle("🥤 ENCONTRÁ LA BOLITA")
        .setDescription(
          `**${jugador1?.username || "Jugador 1"}** vs. **${jugador2?.username || "Jugador 2"}**\n\n` +
          "La bolita está escondida debajo de uno de los tres vasos.\n" +
          "Cada jugador debe elegir un vaso. Las elecciones son secretas y se revelarán cuando ambos hayan elegido."
        )
        .addFields({
          name: "Estado",
          value: "🟡 Esperando que ambos elijan..."
        })
        .setFooter({
          text: "LA VAGANCIA • Elegí con cuidado"
        });

      return interaction.update({
        content: "",
        embeds: [embed],
        components: crearBotonesVasos()
      });
    }

    // RECHAZAR DESAFÍO
    if (interaction.customId === "bolita_decline") {
      if (interaction.user.id !== game.rivalId) {
        return interaction.reply({
          content: "Solo la persona desafiada puede rechazarlo.",
          ephemeral: true
        });
      }

      bolitaGames.delete(gameId);

      return interaction.update({
        content: "",
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle("🚫 Desafío rechazado")
            .setDescription("El rival rechazó la partida.")
        ],
        components: []
      });
    }

    // ELEGIR VASO
    if (interaction.customId.startsWith("bolita_pick_")) {
      if (game.phase !== "playing") {
        return interaction.reply({
          content: "La partida todavía no está activa.",
          ephemeral: true
        });
      }

      if (
        ![game.challengerId, game.rivalId].includes(interaction.user.id)
      ) {
        return interaction.reply({
          content: "No participás en esta partida.",
          ephemeral: true
        });
      }

      if (game.choices[interaction.user.id] !== undefined) {
        return interaction.reply({
          content: "Ya elegiste tu vaso. Esperá a que el rival elija.",
          ephemeral: true
        });
      }

      const vaso = Number(
        interaction.customId.replace("bolita_pick_", "")
      );

      if (![0, 1, 2].includes(vaso)) {
        return interaction.reply({
          content: "Ese vaso no es válido.",
          ephemeral: true
        });
      }

      game.choices[interaction.user.id] = vaso;

      await interaction.reply({
        content:
          `✅ Elegiste el vaso ${vaso + 1}. Tu elección queda oculta hasta que el rival elija.`,
        ephemeral: true
      });

      const ambosEligieron =
        game.choices[game.challengerId] !== undefined &&
        game.choices[game.rivalId] !== undefined;

      if (!ambosEligieron) {
        const embed = new EmbedBuilder()
          .setColor(0xD4AF37)
          .setTitle("🥤 ENCONTRÁ LA BOLITA")
          .setDescription(
            "Una elección fue registrada. El otro jugador está eligiendo..."
          )
          .addFields({
            name: "Estado",
            value: "🟡 Falta una elección"
          })
          .setFooter({
            text: "Las elecciones se revelan al final"
          });

        await interaction.message.edit({
          embeds: [embed]
        }).catch(() => {});

        return;
      }

      // CALCULAR RESULTADO
      const eleccion1 = game.choices[game.challengerId];
      const eleccion2 = game.choices[game.rivalId];

      const nombres = ["Vaso 1", "Vaso 2", "Vaso 3"];

      const acierto1 = eleccion1 === game.ball;
      const acierto2 = eleccion2 === game.ball;

      let ganadorId = null;
      let resultado;

      if (acierto1 && acierto2) {
        resultado =
          "🤝 ¡Los dos encontraron la bolita! La partida termina en empate.";

      } else if (acierto1) {
        ganadorId = game.challengerId;
        resultado = `🏆 ¡Ganó <@${ganadorId}>! Encontró la bolita.`;

      } else if (acierto2) {
        ganadorId = game.rivalId;
        resultado = `🏆 ¡Ganó <@${ganadorId}>! Encontró la bolita.`;

      } else {
        resultado = "🤝 Ninguno encontró la bolita. ¡Empate!";
      }

      const jugador1 = await interaction.client.users
        .fetch(game.challengerId)
        .catch(() => null);

      const jugador2 = await interaction.client.users
        .fetch(game.rivalId)
        .catch(() => null);

      const finalEmbed = new EmbedBuilder()
        .setColor(ganadorId ? 0x2ECC71 : 0xF1C40F)
        .setTitle("🥤 RESULTADO — ENCONTRÁ LA BOLITA")
        .setDescription(
          `${resultado}\n\n` +
          `**${jugador1?.username || "Jugador 1"}** eligió: **${nombres[eleccion1]}** ${acierto1 ? "✅" : "❌"}\n` +
          `**${jugador2?.username || "Jugador 2"}** eligió: **${nombres[eleccion2]}** ${acierto2 ? "✅" : "❌"}\n\n` +
          `🔎 La bolita estaba debajo del **${nombres[game.ball]}**.`
        )
        .setFooter({
          text: "LA VAGANCIA • Gracias por jugar"
        });

      bolitaGames.delete(gameId);
      bolitaPlayers.delete(game.challengerId);
      bolitaPlayers.delete(game.rivalId);

      return interaction.message.edit({
        embeds: [finalEmbed],
        components: crearBotonesVasos(true)
      }).catch(() => {});
    }
  }

  // ==============================
  // COMANDOS SLASH
  // ==============================

  if (interaction.isChatInputCommand()) {

    // ==============================
    // ⚡ COMANDO /AURA
    // ==============================

    if (interaction.commandName === "aura") {
      const rival = interaction.options.getUser("usuario");

      if (rival.id === interaction.user.id) {
        return interaction.reply({
          content: "💀 No podés desafiarte a vos mismo. ¡Necesitás un rival!",
          ephemeral: true
        });
      }

      if (rival.bot) {
        return interaction.reply({
          content: "🤖 Los bots no participan en batallas de aura.",
          ephemeral: true
        });
      }

      // Evitar desafíos pendientes duplicados para cualquiera de los dos
      const dueloPendiente = [...auraDuels.values()].some(duelo =>
        duelo.desafiadorId === interaction.user.id ||
        duelo.rivalId === interaction.user.id ||
        duelo.desafiadorId === rival.id ||
        duelo.rivalId === rival.id
      );

      if (dueloPendiente) {
        return interaction.reply({
          content: "⏳ Uno de ustedes ya tiene un desafío de aura pendiente.",
          ephemeral: true
        });
      }

      const idDuelo = interaction.id;

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle("⚡ ¡DESAFÍO DE AURA!")
        .setDescription(
          `**${interaction.user.username}** desafió a **${rival.username}** a una batalla de aura.\n\n` +
          `${rival}, ¿aceptás el desafío?\n\n` +
          "⚔️ Si aceptás, se generará el aura de ambos y se decidirá quién gana."
        )
        .setFooter({
          text: "LA VAGANCIA • Tenés 60 segundos para responder"
        })
        .setTimestamp();

      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`aura_aceptar_${idDuelo}`)
          .setLabel("Aceptar duelo")
          .setEmoji("⚔️")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`aura_rechazar_${idDuelo}`)
          .setLabel("Rechazar")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger)
      );

      const mensaje = await interaction.reply({
        content: `<@${rival.id}>`,
        embeds: [embed],
        components: [botones],
        fetchReply: true
      });

      auraDuels.set(idDuelo, {
        desafiadorId: interaction.user.id,
        rivalId: rival.id
      });

      // El desafío vence después de 60 segundos
      setTimeout(async () => {
        const duelo = auraDuels.get(idDuelo);

        if (!duelo) return;

        auraDuels.delete(idDuelo);

        const embedVencido = new EmbedBuilder()
          .setColor(0x95A5A6)
          .setTitle("⌛ DESAFÍO VENCIDO")
          .setDescription(
            "El desafío de aura venció porque no fue aceptado a tiempo."
          );

        await mensaje.edit({
          embeds: [embedVencido],
          components: []
        }).catch(() => {});
      }, 60000);

      return;
    }

    // ==============================
    // COMANDO /apos
    // ==============================

    if (interaction.commandName === "apos") {
      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🎯 Rol de Apostador")
        .setDescription(
          "Presioná el botón de abajo para adquirir tu rol de apostador.\n\n" +
          "Accedé a beneficios exclusivos y participá en eventos."
        )
        .setFooter({
          text: "Sistema automático de roles"
        });

      const button = new ButtonBuilder()
        .setCustomId("rol_apos")
        .setLabel("Adquirir rol")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder()
        .addComponents(button);

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // ==============================
  // BOTÓN PARA ASIGNAR EL ROL
  // ==============================

  if (interaction.isButton()) {
    if (interaction.customId === "rol_apos") {
      try {
        const member = await interaction.guild.members.fetch(
          interaction.user.id
        );

        if (member.roles.cache.has(ROLE_ID)) {
          return interaction.reply({
            content: "⚠️ Ya tenés este rol.",
            ephemeral: true
          });
        }

        await member.roles.add(ROLE_ID);

        return interaction.reply({
          content: "✅ Ya adquiriste el rol de apostador.",
          ephemeral: true
        });

      } catch (error) {
        console.error("Error al asignar rol:", error);

        const respuesta = {
          content:
            "❌ No pude asignarte el rol. Verificá que el bot tenga el permiso Administrar roles y que su rol esté por encima del rol que querés asignar.",
          ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
          return interaction.followUp(respuesta);
        }

        return interaction.reply(respuesta);
      }
    }
  }
});

// ==============================
// 🔑 INICIAR SESIÓN
// ==============================

client.login(process.env.TOKEN);
