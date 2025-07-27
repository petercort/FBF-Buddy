const { sync } = require('sequelize');
const { EventsTable, UsersTable, BikesTable } = require('../src/db-objects');

jest.mock('sequelize', () => ({
  sync: jest.fn(),
}));

describe('Database Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sync EventsTable with alter option', async () => {
    await EventsTable.sync({ alter: true });
    expect(sync).toHaveBeenCalledWith({ alter: true });
  });

  it('should sync UsersTable without force option', async () => {
    await UsersTable.sync();
    expect(sync).toHaveBeenCalledWith();
  });

  it('should sync BikesTable without force option', async () => {
    await BikesTable.sync();
    expect(sync).toHaveBeenCalledWith();
  });
});