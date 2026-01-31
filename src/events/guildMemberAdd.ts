import { GuildMember } from 'discord.js';
import { UserService } from '../services/UserService';

export default {
    name: 'guildMemberAdd',
    async execute(member: GuildMember) {
        await UserService.logJoin(member);
    }
};
