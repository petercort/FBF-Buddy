import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('hello')
  .setDescription('Hello there!!');

export async function execute(interaction) {
  // Use editReply since interaction is already deferred in app.js
  await interaction.editReply(`Hello there ${interaction.user.username}!`);
}