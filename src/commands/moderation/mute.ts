import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits
} from 'discord.js';
import { ModService } from '../../services/ModService';

export const data = new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Временно ограничить доступ пользователя (Timeout)')
    .addUserOption(opt => opt.setName('target').setDescription('Пользователь').setRequired(true))
    .addStringOption(opt => 
        opt.setName('duration')
            .setDescription('Длительность')
            .setRequired(true)
            .addChoices(
                { name: '1 минута', value: '1m' },
                { name: '10 минут', value: '10m' },
                { name: '1 час', value: '1h' },
                { name: '1 день', value: '1d' },
                { name: '1 неделя', value: '1w' }
            )
    )
    .addStringOption(opt => opt.setName('reason').setDescription('Причина').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember('target') as any;
    const durationStr = interaction.options.getString('duration')!;
    const reason = interaction.options.getString('reason')!;

    if (!target) return interaction.reply({ content: 'Пользователь не найден.', ephemeral: true });
    
    const durations: { [key: string]: number } = {
        '1m': 60 * 1000,
        '10m': 10 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000
    };

    const ms = durations[durationStr];

    try {
        if (!target.moderatable) {
            return interaction.reply({ 
                content: '❌ Я не могу применить мут к этому пользователю. Проверьте иерархию ролей или права администратора.', 
                ephemeral: true 
            });
        }

        await ModService.notifyUser(target, 'МУТ', reason, durationStr);
        await target.timeout(ms, reason);
        await ModService.logAction(interaction.guild, 'MUTE', target.user, interaction.user, reason, 'DISCORD', durationStr);

        await interaction.reply({ content: `✅ Пользователь **${target.user.tag}** отправлен в мут на ${durationStr}.`, ephemeral: true });
    } catch (e: any) {
        console.error('Ошибка при выдаче мута:', e);
        await interaction.reply({ 
            content: `❌ Произошла ошибка: ${e.message || 'неизвестная ошибка API'}.`, 
            ephemeral: true 
        });
    }
}