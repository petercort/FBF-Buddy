const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

jest.mock('discord.js', () => ({
  Client: jest.fn(() => ({
    commands: new Map(),
    on: jest.fn(),
    once: jest.fn(),
    login: jest.fn(),
  })),
  Collection: jest.fn(() => new Map()),
}));

describe('Discord Bot Initialization', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new Client();
  });

  it('should load commands into the client', () => {
    const commandsPath = path.join(__dirname, '../src/commands');
    jest.spyOn(fs, 'readdirSync').mockImplementation((dir) => {
      if (dir === commandsPath) return ['strava', 'utility'];
      if (dir.includes('strava')) return ['get-all-bikes.js'];
      if (dir.includes('utility')) return ['hello.js'];
      return [];
    });

    jest.mock('../src/commands/strava/get-all-bikes.js', () => ({
      data: { name: 'get_all_bikes' },
      execute: jest.fn(),
    }), { virtual: true });

    jest.mock('../src/commands/utility/hello.js', () => ({
      data: { name: 'hello' },
      execute: jest.fn(),
    }), { virtual: true });

    require('../src/app');

    expect(client.commands.size).toBe(2);
    expect(client.commands.has('get_all_bikes')).toBe(true);
    expect(client.commands.has('hello')).toBe(true);
  });

  it('should log in the client with the correct token', () => {
    process.env.discordToken = 'testToken';
    require('../src/app');
    expect(client.login).toHaveBeenCalledWith('testToken');
  });

  it('should handle missing command properties gracefully', () => {
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => ['invalid-command.js']);
    jest.mock('../src/commands/invalid-command.js', () => ({}), { virtual: true });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    require('../src/app');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('is missing a required "data" or "execute" property.'));
  });
});