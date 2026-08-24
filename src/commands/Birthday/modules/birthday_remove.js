import { EmbedBuilder } from 'discord.js';
import { removeBirthday } from '../../../services/birthdayService.js'; // Assumes this service function exists
import { InteractionHelper } from '../../../utils/interactionHelper.js';

export default {
    async execute(interaction, config, client) {
        await InteractionHelper.safeDefer(interaction);

        const guildId = interaction.guildId;
        
        // 🛠️ Check if an admin specified a target user to remove
        const targetUser = interaction.options.getUser("target");
        let userId = interaction.user.id;

        // 🔒 ADMIN CHECK LAYER
        if (targetUser && targetUser.id !== interaction.user.id) {
            const isOwner = config?.commands?.owners?.includes(interaction.user.id) || false;
            const isAdmin = interaction.member.permissions.has('Administrator');

            // Block regular users from deleting other people's birthdays
            if (!isOwner && !isAdmin) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(config?.embeds?.colors?.error || '#ED4245')
                    .setTitle('🔒 Access Denied')
                    .setDescription('You do not have permission to remove another user\'s birthday data.');

                return await InteractionHelper.safeEditReply(interaction, {
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
            // Swap the active target ID to the one chosen by the admin
            userId = targetUser.id;
        }

        // 📝 RUN REMOVE PROCESS
        await removeBirthday(client, guildId, userId);

        // 🎨 VISUAL CONFIRMATION RESPONSE
        const embed = new EmbedBuilder()
            .setColor(config?.embeds?.colors?.success || '#57F287')
            .setTitle('❌ Birthday Removed')
            .setDescription(`Successfully removed the birthday data for <@${userId}>.`)
            .setFooter({
                text: config?.embeds?.footer?.text || "Titan Bot",
                iconURL: config?.embeds?.footer?.icon || null
            });

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [embed]
        });
    }
};
