import { GuildMember } from 'discord.js';
import { UserService } from '../services/UserService';

export default {
    name: 'guildMemberRemove',
    async execute(member: GuildMember) {
        await UserService.logLeave(member);
    }
};
