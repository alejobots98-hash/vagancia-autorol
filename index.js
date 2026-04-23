require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// ✅ TU ROL
const ROLE_ID = "1469148560489582694";

client.once(Events.ClientReady, () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

// 👉 COMANDO /apos
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "apos") {

    const embed = new EmbedBuilder()
      .setColor("#2b2d31") // gris oscuro estilo discord
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
});

// 👉 BOTÓN
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "rol_apos") {
    const member = interaction.member;

    if (member.roles.cache.has(ROLE_ID)) {
      return interaction.reply({
        content: "⚠️ Ya tenés este rol.",
        ephemeral: true
      });
    }

    await member.roles.add(ROLE_ID);

    await interaction.reply({
      content: "✅ Ya adquiriste el rol de apostador.",
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);