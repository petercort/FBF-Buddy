import { Op } from 'sequelize';
import { jest } from '@jest/globals';
import { retireInactiveBikes } from '../services/backend/src/shared-library/bike-reconciliation.js';

describe('Bike reconciliation', () => {
  it('marks stored bikes that are not active in Strava as retired', async () => {
    const BikesTable = { update: jest.fn() };

    await retireInactiveBikes(BikesTable, 'user-1', ['active-bike']);

    expect(BikesTable.update).toHaveBeenCalledWith(
      { retired: true },
      { where: { userId: 'user-1', retired: false, bikeId: { [Op.notIn]: ['active-bike'] } } }
    );
  });

  it('marks all non-retired stored bikes when Strava has no active bikes', async () => {
    const BikesTable = { update: jest.fn() };

    await retireInactiveBikes(BikesTable, 'user-1', []);

    expect(BikesTable.update).toHaveBeenCalledWith(
      { retired: true },
      { where: { userId: 'user-1', retired: false } }
    );
  });
});
