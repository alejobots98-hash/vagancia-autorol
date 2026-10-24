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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // ⚠️ Necesario para leer comandos con prefijo (.)
  ]
});

// ✅ IDs DE CONFIGURACIÓN
const ROLE_ID = "1469148560489582694";
const CLIENT_ID = "1496661078619459615";
const GUILD_ID = "1211757600379772939";

// 👉 COMANDOS SLASH (Solo dejamos /apos)
const commands = [
  new SlashCommandBuilder()
    .setName("apos")
    .setDescription("Obtener rol de apostador")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// 🎲 FUNCIÓN PARA GENERAR LA DISTANCIA Y MENSAJES EXAGERADOS
function generarAvioncito() {
  const rand = Math.random() * 100;

  let distancia, titulo, comentario, color;

  if (rand < 25) { // 25% Pésimo
    distancia = Math.random() * (2.00 - 0.10) + 0.10;
    titulo = "💥 ¡DESASTRE AERODINÁMICO!";
    comentario = "Se estrelló contra la mesa apenas rozó el aire. Ni un plomo de pesca caía tan rápido.";
    color = 0xE74C3C;

  } else if (rand < 60) { // 35% Corto
    distancia = Math.random() * (50.00 - 2.01) + 2.01;
    titulo = "🍃 VUELO DOMÉSTICO";
    comentario = "Un vuelo modesto pero digno. Se clavó justo al lado del bote de basura.";
    color = 0xE67E22;

  } else if (rand < 85) { // 25% Medio
    distancia = Math.random() * (500.00 - 50.01) + 50.01;
    titulo = "✈️ PLANEADOR EXPERTO";
    comentario = "¡Impresionante! Agarró una corriente térmica y cruzó varias manzanas antes de tocar tierra.";
    color = 0xF1C40F;

  } else if (rand < 95) { // 10% Largo
    distancia = Math.random() * (10000.00 - 500.01) + 500.01;
    titulo = "🚀 TURBINA SUPERSÓNICA";
    comentario = "¡Cruzó la ciudad entera! Superó la altura de los edificios y casi se lo traga la turbina de un Boeing 747.";
    color = 0x2ECC71;

  } else if (rand < 99) { // 4% Épico
    distancia = Math.random() * (1000000.00 - 10000.01) + 10000.01;
    titulo = "🌌 ÓRBITA ESTRATOSFÉRICA";
    comentario = "Rompió la barrera del sonido, cruzó la estratósfera y rozó la Estación Espacial Internacional.";
    color = 0x3498DB;

  } else { // 1% Legendario
    distancia = Math.random() * (40075000.00 - 1000001.00) + 1000001.00;
    titulo = "🪐 VIAJERO INTERGALÁCTICO";
    comentario = "¡DESAFÍA TODAS LAS LEYES DE LA FÍSICA! Le dio la vuelta completa al planeta Tierra y sigue flotando en el vacío exterior.";
    color = 0x9B59B6;
  }

  return { distancia, titulo, comentario, color };
}

// 📏 FORMATEADOR DE DISTANCIA
function formatearDistancia(metros) {
  if (metros >= 1000) {
    const km = metros / 1000;
    const kmStr = km.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const mStr = metros.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${kmStr} km (${mStr} m)`;
  } else {
    return `${metros.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} metros`;
  }
}

// 🚀 CUANDO PRENDE EL BOT
client.once(Events.ClientReady, async () => {
  console.log(`Bot listo como ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Comando /apos registrado correctamente");
  } catch (error) {
    console.error("Error al registrar comandos:", error);
  }
});

// 📌 COMANDO CON PREFIJO (.avioncito)
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return; // Ignora bots

  if (message.content.toLowerCase() === ".avioncito") {
    const { distancia, titulo, comentario, color } = generarAvioncito();
    const distanciaTexto = formatearDistancia(distancia);
    const nombreUsuario = message.member?.displayName || message.author.username;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`✈️ ${titulo}`)
      .setDescription(`**${nombreUsuario}** lanzó su avioncito de papel.`)
      .addFields(
        { name: "📏 Distancia recorrida", value: `\`\`\`\n${distanciaTexto}\n\`\`\``, inline: false },
        { name: "📝 Resultado", value: comentario, inline: false }
      );

    await message.channel.send({ embeds: [embed] });
  }
});

// 📌 INTERACCIONES SLASH Y BOTONES
client.on(Events.InteractionCreate, async interaction => {

  // Slash Command /apos
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "apos") {
      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🎯 Rol de Apostador")
        .setDescription(
          "Presioná el botón de abajo para **adquirir tu rol de apostador**.\n\n" +
          "Accedé a beneficios exclusivos y participá en eventos."
        )
        .setFooter({ text: "Sistema automático de roles" });

      const button = new ButtonBuilder()
        .setCustomId("rol_apos")
        .setLabel("Adquirir rol")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // Botón de rol
  if (interaction.isButton()) {
    if (interaction.customId === "rol_apos") {
      const member = interaction.member;

      if (member.roles.cache.has(ROLE_ID)) {
        return interaction.reply({
          content: "⚠️ Ya tenés este rol.",
          ephemeral: true
        });
      }

      try {
        await member.roles.add(ROLE_ID);
        await interaction.reply({
          content: "✅ Ya adquiriste el rol de apostador.",
          ephemeral: true
        });
      } catch (err) {
        console.error("Error al asignar rol:", err);
        await interaction.reply({
          content: "❌ Hubo un error al intentar asignarte el rol. Verificá los permisos del bot.",
          ephemeral: true
        });
      }
    }
  }
});

client.login(process.env.TOKEN);