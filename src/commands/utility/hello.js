import { SlashCommandBuilder } from 'discord.js';

export default {
  name: 'hello',
  description: 'A simple hello command.',
  execute: () => {
    console.log('Hello, world!');
  },
};