import { Op } from 'sequelize';
import { jest } from '@jest/globals';
import { removeInactiveBikes } from '../services/backend/src/shared-library/bike-reconciliation.js';

describe('Bike reconciliation', () => {
  it('removes stored bikes that are not active in Strava', async () => {
    const BikesTable = { destroy: jest.fn() };

    await removeInactiveBikes(BikesTable, 'user-1', ['active-bike']);

    expect(BikesTable.destroy).toHaveBeenCalledWith({
      where: { userId: 'user-1', bikeId: { [Op.notIn]: ['active-bike'] } }
    });
  });

  it('removes all stored bikes when Strava has no active bikes', async () => {
    const BikesTable = { destroy: jest.fn() };

    await removeInactiveBikes(BikesTable, 'user-1', []);

    expect(BikesTable.destroy).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});
