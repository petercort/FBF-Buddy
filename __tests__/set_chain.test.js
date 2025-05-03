const setChain = require('../src/commands/strava/set_chain');
const bikes = require('../src/models/bikes');

jest.mock('../src/models/bikes');

describe('/set_chain command', () => {
  it('should set the specified chain as active', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';

    const mockBike = {
      name: bikeName,
      chains: [
        { name: 'Backup Chain', isActive: true },
        { name: chainName, isActive: false },
      ],
      save: jest.fn(),
    };

    bikes.findOne = jest.fn().mockResolvedValue(mockBike);

    const result = await setChain.execute(bikeName, chainName);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(mockBike.chains[0].isActive).toBe(false);
    expect(mockBike.chains[1].isActive).toBe(true);
    expect(mockBike.save).toHaveBeenCalled();
    expect(result).toBe(`Chain ${chainName} is now the active chain for bike ${bikeName}.`);
  });

  it('should return an error if the bike is not found', async () => {
    const bikeName = 'Nonexistent Bike';
    const chainName = 'Race Chain';

    bikes.findOne = jest.fn().mockResolvedValue(null);

    const result = await setChain.execute(bikeName, chainName);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(result).toBe(`Bike with name ${bikeName} not found.`);
  });

  it('should return an error if the chain is not found', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Nonexistent Chain';

    const mockBike = {
      name: bikeName,
      chains: [
        { name: 'Backup Chain', isActive: true },
      ],
      save: jest.fn(),
    };

    bikes.findOne = jest.fn().mockResolvedValue(mockBike);

    const result = await setChain.execute(bikeName, chainName);

    expect(bikes.findOne).toHaveBeenCalledWith({ where: { name: bikeName } });
    expect(result).toBe(`Chain with name ${chainName} not found for bike ${bikeName}.`);
  });

  it('should handle errors gracefully', async () => {
    const bikeName = 'Road Bike';
    const chainName = 'Race Chain';

    bikes.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

    const result = await setChain.execute(bikeName, chainName);

    expect(result).toBe('An error occurred while setting the active chain.');
  });
});