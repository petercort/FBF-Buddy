import bikes from '../../models/bikes.js';

export default {
  name: 'set_chain_mileage',
  description: 'Sets the mileage of an existing chain for a bike.',
  execute: async (bikeName, chainName, mileage) => {
    try {
      const bike = await bikes.findOne({ where: { name: bikeName } });
      if (!bike) {
        return `Bike with name ${bikeName} not found.`;
      }

      const chain = bike.chains.find((c) => c.name === chainName);
      if (!chain) {
        return `Chain with name ${chainName} not found for bike ${bikeName}.`;
      }

      chain.mileage = parseInt(mileage, 10);
      await bike.save();

      return `Mileage for chain ${chainName} on bike ${bikeName} set to ${mileage}.`;
    } catch (error) {
      console.error(error);
      return 'An error occurred while setting the chain mileage.';
    }
  },
};