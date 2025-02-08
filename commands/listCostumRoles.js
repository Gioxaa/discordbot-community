const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
const { readDatabase } = require('../utils/database');

module.exports = {
  name: 'listcostumroles',
  execute: async (interaction) => {
    // Initial loading embed
    const loadingEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('<a:loading:1076536009147289650> Fetching Custom Roles...')
      .setDescription('```css\n[ SCANNING THE CUSTOM ROLE REGISTRY ]\n```');
      
    await interaction.reply({ embeds: [loadingEmbed], ephemeral: false });
    
    // Read the database for custom roles
    const database = readDatabase();
    if (!database.roles || database.roles.length === 0) {
      const noRolesEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚫 No Custom Roles Found')
        .setDescription('```diff\n- There are no custom roles registered in the database.\n```')
        .setThumbnail('https://i.imgur.com/X8vB9PU.png')
        .setTimestamp()
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
        });
      
      return interaction.editReply({ embeds: [noRolesEmbed], ephemeral: true });
    }
    
    // Prepare arrays for listing role information
    let nameField = [];
    let roleField = [];
    let statusField = [];
    
    // Process each registered custom role
    database.roles.forEach(entry => {
      const user = interaction.guild.members.cache.get(entry.userId);
      const role = interaction.guild.roles.cache.get(entry.roleId);
      
      if (user && role) {
        // Determine booster status for extra flair
        const isBooster = !!user.premiumSince;
        const status = isBooster ? 'Booster 🚀' : 'Accessed';
        
        nameField.push(user.toString());
        roleField.push(role.toString());
        statusField.push(status);
      }
    });
    
    // If no valid entries are found, notify the user
    if (nameField.length === 0) {
      const noValidEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚫 No Custom Roles Available')
        .setDescription('```diff\n- No valid custom roles found on this server.\n```')
        .setThumbnail('https://i.imgur.com/9n1qF3x.png')
        .setTimestamp()
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
        });
      
      return interaction.editReply({ embeds: [noValidEmbed], ephemeral: true });
    }
    
    // Build the final, super cool list embed
    const listEmbed = new EmbedBuilder()
      .setTitle('📌 Daftar Custom Roles')
      .setColor('#0099FF')
      .setTimestamp()
      .setThumbnail('https://i.imgur.com/Z7eYd3H.png')
      .setDescription('```css\n[ CUSTOM ROLES REGISTRY ]\n```')
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      });
    
    listEmbed.addFields(
      { name: '**Name**', value: nameField.join('\n'), inline: true },
      { name: '**Role**', value: roleField.join('\n'), inline: true },
      { name: '**Status**', value: statusField.join('\n'), inline: true }
    );
    
    // Create an action row with a refresh button for extra interactivity
    
    // Edit the initial reply with the final embed and the refresh button
    await interaction.editReply({ embeds: [listEmbed]});
  }
};
