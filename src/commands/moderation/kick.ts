import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits
} from 'discord.js';
import { ModService } from '../../services/ModService';

export const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Исключить пользователя с сервера')
    .addUserOption(opt => opt.setName('target').setDescription('Пользователь').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Причина исключения').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember('target') as any;
    const reason = interaction.options.getString('reason')!;

    if (!target) return interaction.reply({ content: 'Пользователь не найден.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: 'Я не могу исключить этого пользователя (недостаточно прав).', ephemeral: true });

    await ModService.notifyUser(target, 'КИК', reason);
    await target.kick(reason);
    await ModService.logAction(interaction.guild, 'KICK', target.user, interaction.user, reason, 'DISCORD');

    await interaction.reply({ content: `✅ Пользователь **${target.user.tag}** успешно исключен.`, ephemeral: true });
}