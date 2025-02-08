require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Menampilkan pong!')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('confession')
    .setDescription('Submit a confession anonymously')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('createcostumroles')
    .setDescription('Membuat role custom dengan nama, warna, dan icon (opsional)')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Nama role')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('color')
        .setDescription('Warna dalam hex (tanpa #)')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option
        .setName('icon')
        .setDescription('Icon role (opsional)')
        .setRequired(false)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('deletecostumroles')
    .setDescription('Menghapus role custom dari user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User yang role custom-nya ingin dihapus')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('listcostumroles')
    .setDescription('Menampilkan daftar role custom')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu')
    .toJSON(),
  // Tambahkan command introduction
  new SlashCommandBuilder()
    .setName('introduction')
    .setDescription('Submit your personal introduction')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Menghapus semua perintah global dan guild...');
    // Hapus semua command global
    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: [] }
    );
    // Hapus semua command guild
    await rest.put(
      Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
      { body: [] }
    );
    console.log('Semua perintah sebelumnya telah dihapus.');

    console.log('Mendaftarkan perintah baru...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Slash command berhasil diperbarui.');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
})();
