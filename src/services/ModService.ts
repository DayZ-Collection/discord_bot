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
            KICK: { hex: Colors.Orange, ansi: '[1;33m' },
            MUTE: { hex: Colors.Blue, ansi: '[1;34m' }
        };

        const style = actionColors[action];
        const platformLabel = origin === 'DISCORD' ? '🌐 DISCORD' : '🎮 DAYZ SERVER';
        
        const embed = new EmbedBuilder()
            .setTitle(`${action} | Отчет безопасности`)
            .setColor(style.hex)
            .setDescription(`\`\`\`ansi\n${style.ansi}┏━━━━━━━━━━━━ ИНЦИДЕНТ БЕЗОПАСНОСТИ ━━━━━━━━━━━━┓\n┃ ИСТОЧНИК: ${platformLabel}\n┃ ДЕЙСТВИЕ: ${action}\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛[0m\n\`\`\``)
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