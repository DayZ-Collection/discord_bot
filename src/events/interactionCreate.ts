import { Interaction, ChatInputCommandInteraction, ModalSubmitInteraction, ButtonInteraction } from 'discord.js';
import { TaskEngine } from '../services/TaskEngine';
import { TaskEmbedBuilder } from '../embeds/TaskEmbedBuilder';
import { ITask, TaskPriority, TaskStatus } from '../models/Task';

export class InteractionHandler {
    private taskEngine = new TaskEngine();

    public async handle(interaction: Interaction) {
        if (interaction.isChatInputCommand()) {
            await this.handleSlashCommand(interaction);
        } else if (interaction.isModalSubmit()) {
            await this.handleModalSubmit(interaction);
        } else if (interaction.isButton()) {
            await this.handleButton(interaction);
        }
    }

    private async handleSlashCommand(interaction: ChatInputCommandInteraction) {
        const { commandName } = interaction;

        // Глобальная проверка: только администраторы могут использовать команды бота
        if (!interaction.memberPermissions?.has('Administrator')) {
            return interaction.reply({ 
                content: '❌ У вас недостаточно прав для использования систем управления DayZ OS.', 
                ephemeral: true 
            });
        }

        try {
            let commandPath = '';
            
            // Логика для команды task (так как у неё есть подкоманды в разных файлах или в одном)
            if (commandName === 'task') {
                commandPath = `../commands/tasks/create`; // Пока у нас создание в create.ts
            } else {
                // Для модерации (kick, ban, mute)
                commandPath = `../commands/moderation/${commandName}`;
            }

            const command = require(commandPath);
            await command.execute(interaction);
        } catch (error) {
            console.error(`Ошибка при выполнении команды ${commandName}:`, error);
            await interaction.reply({ content: '❌ Произошла ошибка при выполнении этой команды!', ephemeral: true });
        }
    }

    private async handleModalSubmit(interaction: ModalSubmitInteraction) {
        if (interaction.customId.startsWith('task_create_modal_')) {
            const priority = interaction.customId.split('_').pop() as TaskPriority;
            const title = interaction.fields.getTextInputValue('task_title');
            const description = interaction.fields.getTextInputValue('task_description');

            const task = this.taskEngine.createTask({
                title,
                description,
                priority,
                creatorId: interaction.user.id
            });

            const taskDisplay = TaskEmbedBuilder.build(task);
            
            // Отправляем в канал задач
            const taskChannelId = process.env.TASK_CHANNEL_ID;
            const channel = interaction.guild?.channels.cache.get(taskChannelId!) as any;

            if (channel) {
                await channel.send({ 
                    embeds: taskDisplay.embeds, 
                    components: taskDisplay.components 
                });
                // Минимальное подтверждение для закрытия модалки без текста
                await interaction.deferReply({ ephemeral: true });
                await interaction.deleteReply();
            } else {
                await interaction.reply({ content: '❌ Ошибка: Канал для задач не найден в .env', ephemeral: true });
            }
        }
    }

    private async handleButton(interaction: ButtonInteraction) {
        const [action, type, taskId] = interaction.customId.split('_');

        if (action === 'task') {
            const currentTask = this.taskEngine.getTaskById(taskId);
            if (!currentTask) return interaction.reply({ content: '❌ Задача не найдена.', ephemeral: true });

            let task: ITask | null = null;

            if (type === 'assign') {
                // Если задача уже кем-то взята
                if (currentTask.assigneeId) {
                    const isMe = currentTask.assigneeId === interaction.user.id;
                    return interaction.reply({ 
                        content: isMe ? '✅ Вы уже назначены на эту задачу.' : `❌ Эту задачу уже взял <@${currentTask.assigneeId}>.`, 
                        ephemeral: true 
                    });
                }
                task = this.taskEngine.assignTask(taskId, interaction.user.id);
            } else if (type === 'status') {
                if (currentTask.assigneeId !== interaction.user.id) {
                    return interaction.reply({ 
                        content: '❌ Только исполнитель может менять статус этой задачи.', 
                        ephemeral: true 
                    });
                }

                if (currentTask.status === TaskStatus.DONE) {
                    return interaction.reply({ content: '✅ Задача уже завершена.', ephemeral: true });
                }

                const nextStatus = currentTask.status === TaskStatus.TODO 
                    ? TaskStatus.IN_PROGRESS 
                    : TaskStatus.DONE;

                task = this.taskEngine.updateTaskStatus(taskId, nextStatus);
                
                if (task) {
                    const response = TaskEmbedBuilder.build(task);
                    await interaction.update({ embeds: response.embeds, components: response.components });
                }
                return;
            }

            if (task) {
                const response = TaskEmbedBuilder.build(task);
                await interaction.update({ embeds: response.embeds, components: response.components });
            }
        }
    }
}
