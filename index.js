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
// COMANDOS SLASH
// ==============================

const commands = [
  new SlashCommandBuilder()
    .setName("apos")
    .setDescription("Obtener rol de apostador")
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

  // 50% de probabilidad exacta de hacer gol
  const gol = Math.random() < 0.5;

  let ladoArquero, titulo, comentario, color, movimientoArquero;

  if (gol) {
    titulo = "⚽ ¡GOOOOOOL!";
    color = 0x2ECC71;

    // Si es gol, el arquero o bien se tira a otro lado o roza la pelota pero entra igual
    const coincidaLado = Math.random() < 0.3;
    ladoArquero = coincidaLado 
      ? ladoPateado 
      : lados.filter(l => l !== ladoPateado)[Math.floor(Math.random() * 2)];

    if (ladoArquero !== ladoPateado) {
      movimientoArquero = `Se tiró a la **${ladoArquero}**, pero la pelota fue a la **${ladoPateado}**.`;
      comentario = "¡Lo engañó por completo! El arquero quedó pagando.";
    } else {
      movimientoArquero = `Se tiró a la **${ladoArquero}**, pero no pudo detener el disparo.`;
      comentario = "¡Le ganó con un remate potente! La pelota terminó adentro.";
    }

  } else {
    titulo = "🧤 ¡NO HAY GOL!";
    color = 0xE74C3C;

    const fueAtajado = Math.random() < 0.7; // 70% atajada, 30% fuera/travesaño

    if (fueAtajado) {
      ladoArquero = ladoPateado;
      movimientoArquero = `Se tiró a la **${ladoArquero}** y adivinó el remate.`;
      comentario = "¡Atajadón del arquero! Se quedó con la pelota y salvó a su equipo.";
    } else {
      ladoArquero = lados[Math.floor(Math.random() * lados.length)];
      movimientoArquero = `El arquero se tiró a la **${ladoArquero}**.`;
      comentario = "¡El remate se fue completamente desviado por arriba del travesaño!";
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

    console.log("Comando /apos registrado correctamente.");
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
// 🎯 SLASH COMMAND Y BOTÓN DE ROL
// ==============================

client.on(Events.InteractionCreate, async interaction => {
  // Comando /apos
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "apos") {
      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🎯 Rol de Apostador")
        .setDescription(
          "Presioná el botón de abajo para **adquirir tu rol de apostador**.\n\n" +
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

  // Botón para asignar el rol
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