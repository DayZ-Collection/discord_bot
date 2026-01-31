import { 
    GuildMember, 
    EmbedBuilder, 
    TextChannel, 
    Colors,
    User
} from 'discord.js';

export class ModService {
    private static readonly LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

    public static async logAction(
        guild: any, 
        action: 'BAN' | 'KICK' | 'MUTE', 
        target: User, 
        moderator: User, 
        reason: string,
        origin: 'DISCORD' | 'GAME' = 'DISCORD',
        duration?: string
    ) {
        const logChannel = guild.channels.cache.get(this.LOG_CHANNEL_ID) as TextChannel;
        if (!logChannel) return;

        const actionColors = {
            BAN: { hex: Colors.Red, ansi: '[1;31m' },
            KICK: { hex: Colors.Yellow, ansi: '[1;33m' },
            MUTE: { hex: Colors.Blue, ansi: '[1;34m' }
        };

        const style = actionColors[action];
        const platformLabel = origin === 'DISCORD' ? 'DISCORD' : 'DAYZ SERVER';
        
        // Математический расчет для рамки (внутренняя ширина 43 символа, как в задачах)
        const innerWidth = 43;
        
        const line1Content = ` ИНЦИДЕНТ БЕЗОПАСНОСТИ`;
        const padding1 = ' '.repeat(Math.max(0, innerWidth - line1Content.length));

        const line2Content = ` ИСТОЧНИК: ${platformLabel}`;
        const padding2 = ' '.repeat(Math.max(0, innerWidth - line2Content.length));
        
        const line3Content = ` ДЕЙСТВИЕ: ${action}`;
        const padding3 = ' '.repeat(Math.max(0, innerWidth - line3Content.length));

        const ansiHeader = `\`\`\`ansi\n${style.ansi}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃${line1Content}${padding1}┃\n┃${line2Content}${padding2}┃\n┃${line3Content}${padding3}┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛[0m\n\`\`\``;

        const embed = new EmbedBuilder()
            .setColor(style.hex)
            .setTitle('🛡️ Протокол безопасности обновлен')
            .setDescription(ansiHeader)
            .addFields(
                { name: '👤 Нарушитель', value: `\`${target.tag}\`\n(ID: ${target.id})`, inline: true },
                { name: '🛡️ Модератор', value: `\`${moderator.tag}\``, inline: true },
                { name: '📝 Причина', value: reason },
            )
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: `DayZ OS Security Hub | Origin: ${origin}` })
            .setTimestamp();

        if (duration) {
            embed.addFields({ name: '⏳ Duration', value: duration, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
    }

    public static async notifyUser(
        target: GuildMember, 
        action: string, 
        reason: string, 
        duration?: string
    ) {
        try {
            const embed = new EmbedBuilder()
                .setTitle(`Уведомление о наказании`)
                .setDescription(`Вы получили **${action}** на сервере **${target.guild.name}**.`)
                .addFields(
                    { name: 'Причина', value: reason },
                    { name: 'Длительность', value: duration || 'Постоянно', inline: true }
                )
                .setColor(Colors.Red)
                .setFooter({ text: 'Если вы считаете наказание ошибочным, свяжитесь с администрацией.' });

            await target.send({ embeds: [embed] });
        } catch (e) {
            console.log(`Не удалось отправить DM пользователю ${target.user.tag}`);
        }
    }
}