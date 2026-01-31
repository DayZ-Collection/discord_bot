import { Client, GatewayIntentBits, Collection, REST, Routes, Partials } from 'discord.js';
import * as dotenv from 'dotenv';
import { InteractionHandler } from './events/interactionCreate';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.GuildMember, Partials.User, Partials.Message],
});

const interactionHandler = new InteractionHandler();

// Простейшая регистрация команд (для теста)
async function registerCommands() {
    const commands = [];
    const foldersPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(foldersPath)) return;

    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

client.once('clientReady', async (c) => {
    console.log(`[1;32m[SYSTEM]: Logged in as ${c.user?.tag}[0m`);
    await registerCommands();
});

// Обработка взаимодействий (команды, кнопки, модалки)
client.on('interactionCreate', async (interaction) => {
    await interactionHandler.handle(interaction);
});

// Регистрация событий входа/выхода
import guildMemberAdd from './events/guildMemberAdd';
import guildMemberRemove from './events/guildMemberRemove';

client.on('guildMemberAdd', async (member) => {
    if (member.partial) await member.fetch();
    await guildMemberAdd.execute(member as any);
});

client.on('guildMemberRemove', async (member) => {
    if (member.partial) await member.fetch();
    await guildMemberRemove.execute(member as any);
});

client.login(process.env.DISCORD_TOKEN);