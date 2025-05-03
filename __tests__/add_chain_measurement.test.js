const addChainMeasurement = require('../src/commands/strava/add_chain_measurement');
const bikes = require('../src/models/bikes');

jest.mock('../src/models/bikes');

describe('/add_chain_measurement command', () => {
  it('should add a wear measurement to an existing chain', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';
    const measurement = 0.5;
    const mileage = 300;

    const mockBike = {
      name: bikeName,
      chains: [
        { name: chainName, wearMeasurements: [] },
      ],
      save: jest.fn(),
    };

    bikes.findOne = jest.fn().mockResolvedValue(mockBike);

    const result = await addChainMeasurement.execute(bikeName, chainName, measurement, mileage);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(mockBike.chains[0].wearMeasurements).toHaveLength(1);
    expect(mockBike.chains[0].wearMeasurements[0]).toEqual({
      measurement,
      mileage,
    });
    expect(mockBike.save).toHaveBeenCalled();
    expect(result).toBe(`Wear measurement added for chain ${chainName} on bike ${bikeName}.`);
  });

  it('should return an error if the bike is not found', async () => {
    const bikeName = 'Nonexistent Bike';
    const chainName = 'Race Chain';
    const measurement = 0.5;
    const mileage = 300;

    bikes.findOne = jest.fn().mockResolvedValue(null);

    const result = await addChainMeasurement.execute(bikeName, chainName, measurement, mileage);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(result).toBe(`Bike with name ${bikeName} not found.`);
  });

  it('should return an error if the chain is not found', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Nonexistent Chain';
    const measurement = 0.5;
    const mileage = 300;

    const mockBike = {
      name: bikeName,
      chains: [],
      save: jest.fn(),
    };

    bikes.findOne = jest.fn().mockResolvedValue(mockBike);

    const result = await addChainMeasurement.execute(bikeName, chainName, measurement, mileage);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(result).toBe(`Chain with name ${chainName} not found for bike ${bikeName}.`);
  });

  it('should handle errors gracefully', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';
    const measurement = 0.5;
    const mileage = 300;

    bikes.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

    const result = await addChainMeasurement.execute(bikeName, chainName, measurement, mileage);

    expect(result).toBe('An error occurred while adding the chain measurement.');
  });
});