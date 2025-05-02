import bikes from '../../models/bikes.js';

export default {
  name: 'new_chain',
  description: 'Adds a new chain to an existing bike.',
  execute: async (bikeName, chainName, mileage) => {
    try {
      const bike = await bikes.findOne({ where: { name: bikeName } });
      if (!bike) {
        return `Bike with name ${bikeName} not found.`;
      }

      if (!bike.chains) {
        bike.chains = [];
      }

      bike.chains.push({
        name: chainName,
        mileage: parseInt(mileage, 10),
        isActive: false,
        wearMeasurements: [],
      });

      await bike.save();
      return `Chain ${chainName} added to bike ${bikeName} with mileage ${mileage}.`;
    } catch (error) {
      console.error(error);
      return 'An error occurred while adding the chain.';
    }
  },
};