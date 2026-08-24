import { EmbedBuilder } from 'discord.js';
import { deleteBirthday } from '../../../services/birthdayService.js';
import { InteractionHelper } from '../../../utils/interactionHelper.js';

export default {
    async execute(interaction, config, client) {
        await InteractionHelper.safeDefer(interaction);

        const guildId = interaction.guildId;
        
        // 1. Get the target user option (if provided)
        const targetUser = interaction.options.getUser("target");
        let userId = interaction.user.id;

        // 2. Security Check: If a target user is specified, verify permissions
        if (targetUser && targetUser.id !== interaction.user.id) {
            const isOwner = config?.commands?.owners?.includes(interaction.user.id) || false;
            const isAdmin = interaction.member.permissions.has('Administrator');

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
            // Switch target ID to the user specified by the admin
            userId = targetUser.id;
        }

        // 3. Process the deletion via your service layer
        const result = await deleteBirthday(client, guildId, userId);

        // 4. Handle if the target user doesn't even have a birthday set
        if (result.status === 'not_found') {
            const descriptionText = targetUser && targetUser.id !== interaction.user.id
                ? `<@${userId}> doesn't have a birthday set to remove.`
                : "You don't have a birthday set to remove.";

            const embed = new EmbedBuilder()
                .setColor(config?.embeds?.colors?.error || '#ED4245')
                .setTitle('No Birthday Found')
                .setDescription(descriptionText);
                
            await InteractionHelper.safeEditReply(interaction, {
                embeds: [embed]
            });
            return;
        }

        // 5. Send the success confirmation embed using your config colors
        const successDescription = targetUser && targetUser.id !== interaction.user.id
            ? `The birthday for <@${userId}> has been successfully removed.`
            : 'Your birthday has been successfully removed from the server.';

        const embed = new EmbedBuilder()
            .setColor(config?.embeds?.colors?.success || '#57F287')
            .setTitle('Birthday Removed')
            .setDescription(successDescription)
            .setFooter({
                text: config?.embeds?.footer?.text || "Titan Bot",
                iconURL: config?.embeds?.footer?.icon || null
            });

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [embed]
        });
    }
};
