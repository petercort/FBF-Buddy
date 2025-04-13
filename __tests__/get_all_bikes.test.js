const { execute } = require('../src/commands/strava/get_all_bikes');
const { UsersTable, BikesTable } = require('../src/dbObjects');

jest.mock('../src/dbObjects', () => ({
  UsersTable: { findOne: jest.fn() },
  BikesTable: { findAll: jest.fn() },
}));

describe('get_all_bikes command', () => {
  let interaction;

  beforeEach(() => {
    interaction = {
      user: { id: '12345' },
      reply: jest.fn(),
    };
  });

  it('should prompt user to connect Strava if user is not found', async () => {
    UsersTable.findOne.mockResolvedValue(null);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith({
      content: 'Please connect your Strava using the /connect_strava command.',
      ephemeral: true,
    });
  });

  it('should notify user if no bikes are found', async () => {
    UsersTable.findOne.mockResolvedValue({ userId: '12345' });
    BikesTable.findAll.mockResolvedValue([]);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith({
      content: 'No bikes found! Add a bike by going to https://www.strava.com/settings/gear and adding a bike. Then run /sync_bikes to sync your bikes.',
      ephemeral: true,
    });
  });

  it('should list all bikes if found', async () => {
    UsersTable.findOne.mockResolvedValue({ userId: '12345' });
    BikesTable.findAll.mockResolvedValue([
      {
        name: 'Bike1',
        brand: 'Brand1',
        model: 'Model1',
        distance: 10000,
        lastWaxedDate: '2025-04-01',
        lastWaxedDistance: 5000,
      },
    ]);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith({
      content: `Your bikes:\nBike1: Brand1 Model1. 6 miles. Last waxed on 2025-04-01 at 3 miles.`,
      ephemeral: true,
    });
  });

  it('should handle errors gracefully', async () => {
    UsersTable.findOne.mockRejectedValue(new Error('Database error'));

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith({
      content: 'There was an error querying data, please check back in a bit.',
      ephemeral: true,
    });
  });
});