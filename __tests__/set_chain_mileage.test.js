const setChainMileage = require('../src/commands/strava/set_chain_mileage');
const bikes = require('../src/models/bikes');

jest.mock('../src/models/bikes');

describe('/set_chain_mileage command', () => {
  it('should update the mileage of an existing chain', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';
    const mileage = 200;

    const mockBike = {
      name: bikeName,
      chains: [
        { name: chainName, mileage: 100, isActive: false, wearMeasurements: [] },
      ],
      save: jest.fn(),
    };

    bikes.findOne = jest.fn().mockResolvedValue(mockBike);

    const result = await setChainMileage.execute(bikeName, chainName, mileage);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(mockBike.chains[0].mileage).toBe(mileage);
    expect(mockBike.save).toHaveBeenCalled();
    expect(result).toBe(`Mileage for chain ${chainName} on bike ${bikeName} set to ${mileage}.`);
  });

  it('should return an error if the bike is not found', async () => {
    const bikeName = 'Nonexistent Bike';
    const chainName = 'Race Chain';
    const mileage = 200;

    bikes.findOne = jest.fn().mockResolvedValue(null);

    const result = await setChainMileage.execute(bikeName, chainName, mileage);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(result).toBe(`Bike with name ${bikeName} not found.`);
  });

  it('should return an error if the chain is not found', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Nonexistent Chain';
    const mileage = 200;

    const mockBike = {
      name: bikeName,
      chains: [],
      save: jest.fn(),
    };

    bikes.findOne = jest.fn().mockResolvedValue(mockBike);

    const result = await setChainMileage.execute(bikeName, chainName, mileage);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(result).toBe(`Chain with name ${chainName} not found for bike ${bikeName}.`);
  });

  it('should handle errors gracefully', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';
    const mileage = 200;

    bikes.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

    const result = await setChainMileage.execute(bikeName, chainName, mileage);

    expect(result).toBe('An error occurred while setting the chain mileage.');
  });
});