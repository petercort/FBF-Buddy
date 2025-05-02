import { execute } from '../src/commands/strava/new_chain';
import { findOne } from '../src/models/bikes';

jest.mock('../src/models/bikes');

describe('/new_chain command', () => {
  it('should add a new chain to an existing bike', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';
    const mileage = 100;

    const mockBike = {
      name: bikeName,
      chains: [],
      save: jest.fn(),
    };

    findOne = jest.fn().mockResolvedValue(mockBike);

    const result = await execute(bikeName, chainName, mileage);

    expect(findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(mockBike.chains).toHaveLength(1);
    expect(mockBike.chains[0]).toEqual({
      name: chainName,
      mileage,
      isActive: false,
      wearMeasurements: [],
    });
    expect(mockBike.save).toHaveBeenCalled();
    expect(result).toBe(`Chain ${chainName} added to bike ${bikeName} with mileage ${mileage}.`);
  });

  it('should return an error if the bike is not found', async () => {
    const bikeName = 'Nonexistent Bike';
    const chainName = 'Race Chain';
    const mileage = 100;

    findOne = jest.fn().mockResolvedValue(null);

    const result = await execute(bikeName, chainName, mileage);

    expect(findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(result).toBe(`Bike with name ${bikeName} not found.`);
  });

  it('should handle errors gracefully', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';
    const mileage = 100;

    findOne = jest.fn().mockRejectedValue(new Error('Database error'));

    const result = await execute(bikeName, chainName, mileage);

    expect(result).toBe('An error occurred while adding the chain.');
  });
});