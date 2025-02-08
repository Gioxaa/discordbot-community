const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readDatabase, writeDatabase } = require('../utils/database');

module.exports = {
  execute: async (interaction) => {
    // Initial response with loading style
    const initialEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('<a:loading:1076536009147289650> Processing Request...')
      .setDescription('```css\n[ INITIATING ROLE PURGE PROTOCOL ]\n```');
    
    await interaction.reply({ embeds: [initialEmbed], ephemeral: false });

    // Channel validation
    if (interaction.channelId !== process.env.CUSTOM_ROLE_CHANNEL_ID) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚫 Restricted Access')
        .setDescription(`**This command can only be used in:**\n<#${process.env.CUSTOM_ROLE_CHANNEL_ID}>`)
        .setThumbnail('https://i.imgur.com/X8vB9PU.png');
      
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    // Permission check
    const allowedRoles = process.env.ALLOWED_COSTUMROLE.split(',').map(id => id.trim());
    const hasPermission = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));

    if (!hasPermission) {
      const permEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🔒 Permission Denied')
        .setDescription('```diff\n- You lack the required authority to unleash this command!\n```')
        .addFields({
          name: 'Required Roles',
          value: allowedRoles.map(r => `<@&${r}>`).join('\n') || 'None specified'
        })
        .setFooter({ text: 'Contact server staff for access', iconURL: interaction.user.displayAvatarURL() });
      
      return interaction.editReply({ embeds: [permEmbed] });
    }

    // Target validation
    const member = interaction.options.getMember('user');
    if (!member) {
      const targetEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎯 Invalid Target')
        .setDescription('```fix\nPlease specify a valid user using @mention!\n```')
        .setThumbnail('https://i.imgur.com/9n1qF3x.png');
      
      return interaction.editReply({ embeds: [targetEmbed] });
    }

    // Database check
    const database = readDatabase();
    const roleData = database.roles.find(entry => entry.userId === member.id);

    if (!roleData) {
      const noRoleEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📭 Role Not Found')
        .setDescription(`**${member.displayName}** has no registered custom roles`)
        .addFields({
          name: 'Database Status',
          value: `Entries: ${database.roles.length} roles registered`,
          inline: true
        })
        .setThumbnail(member.displayAvatarURL());
      
      return interaction.editReply({ embeds: [noRoleEmbed] });
    }

    // Role execution
    try {
      const role = await interaction.guild.roles.fetch(roleData.roleId);
      
      if (!role) {
        const ghostEmbed = new EmbedBuilder()
          .setColor('#4B0082')
          .setTitle('👻 Phantom Role')
          .setDescription('Role exists in database but not on server')
          .addFields(
            { name: 'Registered Role ID', value: roleData.roleId, inline: true },
            { name: 'Owner', value: member.toString(), inline: true }
          );
        
        return interaction.editReply({ embeds: [ghostEmbed] });
      }

      // Deletion process
      await role.delete(`Deleted by ${interaction.user.tag} via /deletecostumroles`);
      
      // Update database
      database.roles = database.roles.filter(entry => entry.userId !== member.id);
      writeDatabase(database);

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🗑️ Role Annihilated')
        .setDescription('```diff\n+ SUCCESSFULLY PURGED CUSTOM ROLE +\n```')
        .addFields(
          { name: '🔹 Role Name', value: role.name, inline: true },
          { name: '🔹 Former Owner', value: member.toString(), inline: true },
          { name: '🔹 Executor', value: interaction.user.toString(), inline: true }
        )
        .setThumbnail('https://i.imgur.com/Z7eYd3H.png')
        .setFooter({ 
          text: `Database Updated • ${new Date().toLocaleString()}`, 
          iconURL: interaction.client.user.displayAvatarURL() 
        });


      await interaction.editReply({ 
        embeds: [successEmbed], 
        ephemeral: false 
      });

    } catch (error) {
      // Error embed
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💥 Critical Failure')
        .setDescription('```arm\n[ ROLE DESTRUCTION SEQUENCE FAILED ]\n```')
        .addFields(
          { name: 'Error Code', value: `\`${error.code || 'N/A'}\``, inline: true },
          { name: 'Error Message', value: `\`\`\`${error.message.slice(0, 1000)}\`\`\`` }
        )
        .setFooter({ text: 'Contact bot maintainer', iconURL: interaction.client.user.displayAvatarURL() });
      
      interaction.editReply({ embeds: [errorEmbed] });
      console.error('[ROLE DELETE ERROR]', error);
    }
  }
};