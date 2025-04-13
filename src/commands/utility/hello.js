import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('hello')
	.setDescription('Hello there!!');
export async function execute(interaction) {
	await interaction.reply(`Hello there ${interaction.user.username}!`);
}