const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  execute: async (interaction) => {
    try {
      // Pastikan interaction valid dan merupakan command
      if (!interaction || !interaction.isCommand()) return;

      // Defer reply dengan opsi ephemeral
      await interaction.deferReply({ ephemeral: true });

      const commandList = [
        { name: 'ping', description: '⚡ Check bot responsiveness' },
        { name: 'createcostumroles', description: '🎨 Craft your unique identity' },
        { name: 'listcostumroles', description: '📜 Browse the gallery of roles' },
        { name: 'deletecostumroles', description: '🗑️ Remove outdated creations' },
        { name: 'help', description: '🧭 Navigate my command universe' }
      ];

      // Perhitungan uptime
      const uptime = Math.floor(interaction.client.uptime / 1000);
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const embed = new EmbedBuilder()
        .setColor('#6A00FF')
        .setTitle('<:cosmic_compass:1075986678426992751> **Command Constellation**')
        .setDescription([
          '```diff',
          '+ Explore my command galaxy +',
          '```',
          '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'
        ].join('\n'))
        .setThumbnail('https://i.imgur.com/St4T7vQ.png')
        .setImage('https://i.imgur.com/9HqTz0B.png')
        .addFields(
          {
            name: '🌌 **Core Commands**',
            value: commandList.map(cmd => `✦ \`/${cmd.name}\` - ${cmd.description}`).join('\n'),
            inline: false
          },
          {
            name: '📊 **System Status**',
            value: [
              `⌛ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`,
              `🌍 Servers: ${interaction.client.guilds.cache.size}`,
              `👥 Members: ${interaction.client.users.cache.size}`
            ].join('\n'),
            inline: true
          }
        )
        .setFooter({ 
          text: `Requested by ${interaction.user.username} • Powered by Cosmic Engine`, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Documentation')
          .setURL('https://your-docs.link')
          .setEmoji('📚')
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Support Server')
          .setURL('https://discord.gg/yourserver')
          .setEmoji('🛠️')
          .setStyle(ButtonStyle.Link)
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });

    } catch (error) {
      // Tangani error secara silent (tanpa log ke console)
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ 
            content: '❌ Terjadi kesalahan saat menjalankan command!', 
            components: [] 
          });
        } else {
          await interaction.reply({ 
            content: '❌ Terjadi kesalahan saat menjalankan command!', 
            ephemeral: true 
          });
        }
      } catch (_) {
        // Abaikan jika gagal mengirim pesan error
      }
    }
  }
};
