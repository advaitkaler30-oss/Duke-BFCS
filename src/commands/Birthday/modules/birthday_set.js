import { EmbedBuilder } from 'discord.js';
import { setBirthday } from '../../../services/birthdayService.js';
import { InteractionHelper } from '../../../utils/interactionHelper.js';

export default {
    async execute(interaction, config, client) {
        await InteractionHelper.safeDefer(interaction);

        const month = interaction.options.getInteger("month");
        const day = interaction.options.getInteger("day");
        const guildId = interaction.guildId;
        
        // 🛠️ Check if an admin specified a target user
        const targetUser = interaction.options.getUser("target");
        let userId = interaction.user.id;

        // 🔒 ADMIN CHECK LAYER
        if (targetUser && targetUser.id !== interaction.user.id) {
            const isOwner = config?.commands?.owners?.includes(interaction.user.id) || false;
            const isAdmin = interaction.member.permissions.has('Administrator');

            // If a regular user tries to set someone else's birthday, block them!
            if (!isOwner && !isAdmin) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(config?.embeds?.colors?.error || '#ED4245')
                    .setTitle('🔒 Access Denied')
                    .setDescription('You do not have permission to modify another user\'s birthday data.');

                return await InteractionHelper.safeEditReply(interaction, {
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
            // Swap the active storage target payload to your chosen user ID
            userId = targetUser.id;
        }

        // 📝 RUN SAVE PROCESS (Utilizes your native birthday service logic)
        const result = await setBirthday(client, guildId, userId, month, day);

        // 🎨 VISUAL RESPONSES (Styled matching your pink theme color choices)
        const embed = new EmbedBuilder()
            .setColor(config?.embeds?.colors?.birthday || '#E91E63')
            .setTitle('🎂 Birthday Saved!')
            .setDescription(`The birthday for <@${userId}> has been set to **${result.data.monthName} ${result.data.day}**!`)
            .setFooter({
                text: config?.embeds?.footer?.text || "Titan Bot",
                iconURL: config?.embeds?.footer?.icon || null
            });

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [embed]
        });
    }
};
