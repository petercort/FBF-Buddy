import bikes from '../../models/bikes.js';

export default {
  name: 'add_chain_measurement',
  description: 'Adds a wear measurement for a specific chain on a bike.',
  execute: async (bikeName, chainName, measurement, mileage) => {
    try {
      const bike = await bikes.findOne({ where: { name: bikeName } });
      if (!bike) {
        return `Bike with name ${bikeName} not found.`;
      }

      const chain = bike.chains.find((c) => c.name === chainName);
      if (!chain) {
        return `Chain with name ${chainName} not found for bike ${bikeName}.`;
      }

      chain.wearMeasurements.push({
        measurement: parseFloat(measurement),
        mileage: parseInt(mileage, 10),
      });

      await bike.save();
      return `Wear measurement added for chain ${chainName} on bike ${bikeName}.`;
    } catch (error) {
      console.error(error);
      return 'An error occurred while adding the chain measurement.';
    }
  },
};