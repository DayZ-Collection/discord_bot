import { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ITask, TaskPriority, TaskStatus } from '../models/Task';

export class TaskEmbedBuilder {
    private static readonly PRIORITY_COLORS = {
        [TaskPriority.LOW]: { hex: 0x3498db, ansi: '[1;34m' },
        [TaskPriority.MEDIUM]: { hex: 0xe67e22, ansi: '[1;33m' },
        [TaskPriority.HIGH]: { hex: 0xe74c3c, ansi: '[1;31m' }
    };

    private static readonly STATUS_MAP = {
        [TaskStatus.TODO]: '📂 В ОЖИДАНИИ',
        [TaskStatus.IN_PROGRESS]: '⚙️ В РАБОТЕ',
        [TaskStatus.DONE]: '✅ ГОТОВО',
        [TaskStatus.ARCHIVED]: '📦 В АРХИВЕ'
    };

    public static build(task: ITask) {
        const priorityStyle = this.PRIORITY_COLORS[task.priority];
        const statusText = this.STATUS_MAP[task.status];
        const assignee = task.assigneeId ? `<@${task.assigneeId}>` : '`Не назначен`';

        const createdAt = new Date(task.createdAt);
        const updatedAt = new Date(task.updatedAt);

        // Математически точный расчет отступов для рамки (ширина 43 символа)
        const innerWidth = 43;
        const lineContent = ` ID: #${task.id} | Приоритет: ${task.priority}`;
        const padding = ' '.repeat(Math.max(0, innerWidth - lineContent.length));
        
        const ansiHeader = `\`\`\`ansi\n${priorityStyle.ansi}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃${lineContent}${padding}┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛[0m\n\`\`\``;

        const embed = new EmbedBuilder()
            .setColor(priorityStyle.hex)
            .setTitle(`${this.getStatusEmoji(task.status)} ${task.title}`)
            .setDescription(`${ansiHeader}\n**Описание:**\n${task.description}\n\n---`)
            .addFields(
                { name: '👤 Исполнитель', value: assignee, inline: true },
                { name: '📊 Статус', value: `\`${statusText}\``, inline: true }
            );

        // Если задача готова, показываем время завершения, иначе — таймер создания
        if (task.status === TaskStatus.DONE) {
            embed.addFields({ 
                name: '🏁 Завершено', 
                value: `<t:${Math.floor(updatedAt.getTime() / 1000)}:f>`, 
                inline: true 
            });
        } else {
            embed.addFields({ 
                name: '📅 Создано', 
                value: `<t:${Math.floor(createdAt.getTime() / 1000)}:R>`, 
                inline: true 
            });
        }

        embed.setFooter({ text: `DayZ Development OS | Система управления задачами` })
            .setTimestamp(updatedAt);

        const isDone = task.status === TaskStatus.DONE;
        const isAssigned = !!task.assigneeId;

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`task_assign_${task.id}`)
                .setLabel(isAssigned ? 'Закреплено' : 'Взять задачу')
                .setStyle(isAssigned ? ButtonStyle.Secondary : ButtonStyle.Primary)
                .setEmoji('✋')
                .setDisabled(isAssigned || isDone),
            new ButtonBuilder()
                .setCustomId(`task_status_${task.id}`)
                .setLabel(isDone ? 'Завершено' : 'След. статус')
                .setStyle(isDone ? ButtonStyle.Secondary : ButtonStyle.Success)
                .setEmoji(isDone ? '🏁' : '🔄')
                .setDisabled(isDone)
        );

        return { embeds: [embed], components: [row] };
    }

    private static getStatusEmoji(status: TaskStatus): string {
        switch (status) {
            case TaskStatus.TODO: return '🔴';
            case TaskStatus.IN_PROGRESS: return '🟡';
            case TaskStatus.DONE: return '🟢';
            default: return '⚪';
        }
    }
}