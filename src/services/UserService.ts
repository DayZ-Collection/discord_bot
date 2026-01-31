import { GuildMember, EmbedBuilder, Colors, TextChannel } from 'discord.js';

export class UserService {
    public static async logJoin(member: GuildMember) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(logChannelId!) as TextChannel;
        if (!channel) return;

        const accountCreated = Math.floor(member.user.createdTimestamp / 1000);
        const joinTime = Math.floor(member.joinedTimestamp! / 1000);

        const embed = new EmbedBuilder()
            .setTitle('📥 Новый участник | User Joined')
            .setColor(0x2ecc71) // Green
            .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
            .setDescription(`\`\`\`ansi\n[1;32m┏━━━━━━━━━━━━━━ ДОСЬЕ ПОЛЬЗОВАТЕЛЯ ━━━━━━━━━━━━━━┓\n┃ СТАТУС: НОВЫЙ ВХОД\n┃ ИСТОЧНИК: DISCORD INVITE\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛[0m\n\`\`\``)
            .addFields(
                { name: '👤 Имя пользователя', value: `\`${member.user.tag}\``, inline: true },
                { name: '🆔 ID пользователя', value: `\`${member.id}\``, inline: true },
                { name: '🆕 Аккаунт создан', value: `<t:${accountCreated}:R> (<t:${accountCreated}:D>)`, inline: false },
                { name: '📅 Зашел на сервер', value: `<t:${joinTime}:F>`, inline: false },
                { name: '👥 Население сервера', value: `\`${member.guild.memberCount}\` участников`, inline: true }
            )
            .setFooter({ text: `DayZ OS | Intelligence Module` })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }

    public static async logLeave(member: GuildMember) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(logChannelId!) as TextChannel;
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle('📤 Участник покинул сервер | User Left')
            .setColor(0xe74c3c) // Red
            .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
            .setDescription(`\`\`\`ansi\n[1;31m┏━━━━━━━━━━━━━━ USER EXIT ━━━━━━━━━━━━━━┓\n┃ STATUS: DISCONNECTED\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛[0m\n\`\`\``)
            .addFields(
                { name: '👤 Username', value: `\`${member.user.tag}\``, inline: true },
                { name: '🆔 User ID', value: `\`${member.id}\``, inline: true },
                { name: '👥 Remaining Population', value: `\`${member.guild.memberCount}\` members`, inline: true }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }
}
