import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder,
    PermissionFlagsBits
} from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('task')
    .setDescription('Управление задачами разработки')
    .addSubcommand(sub =>
        sub.setName('create')
            .setDescription('Создать новую задачу')
            .addStringOption(opt => 
                opt.setName('priority')
                    .setDescription('Приоритет задачи')
                    .setRequired(true)
                    .addChoices(
                        { name: '🔴 High', value: 'HIGH' },
                        { name: '🟠 Medium', value: 'MEDIUM' },
                        { name: '🔵 Low', value: 'LOW' }
                    )
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() === 'create') {
        const priority = interaction.options.getString('priority');

        const modal = new ModalBuilder()
            .setCustomId(`task_create_modal_${priority}`)
            .setTitle('Создание новой задачи');

        const titleInput = new TextInputBuilder()
            .setCustomId('task_title')
            .setLabel('Название задачи')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Например: Пофиксить спавн лута в Старом Соборе')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('task_description')
            .setLabel('Описание (поддерживает Markdown)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Опишите проблему или задачу максимально подробно...')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
}