import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits,
    EmbedBuilder,
    Colors
} from 'discord.js';
import { ModService } from '../../services/ModService';

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Заблокировать пользователя')
    .addUserOption(opt => opt.setName('target').setDescription('Пользователь').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Причина бана').setRequired(true))
    .addIntegerOption(opt => opt.setName('delete_messages').setDescription('Удалить сообщения за (дней)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember('target') as any;
    const reason = interaction.options.getString('reason')!;
    const days = interaction.options.getInteger('delete_messages') || 0;

    if (!target) return interaction.reply({ content: 'Пользователь не найден.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: 'Я не могу забанить этого пользователя (недостаточно прав).', ephemeral: true });

    await ModService.notifyUser(target, 'БАН', reason);
    await target.ban({ reason, deleteMessageSeconds: days * 86400 });
    await ModService.logAction(interaction.guild, 'BAN', target.user, interaction.user, reason, 'DISCORD');

    await interaction.reply({ content: `✅ Пользователь **${target.user.tag}** успешно заблокирован.`, ephemeral: true });
}