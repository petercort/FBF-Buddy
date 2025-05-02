// Convert CommonJS to ES Module
import bikes from '../../models/bikes.js';

export default {
  name: 'set_chain',
  description: 'Changes the actively tracked chain for a bike.',
  execute: async (bikeName, chainName) => {
    try {
      const bike = await bikes.findOne({ where: { name: bikeName } });
      if (!bike) {
        return `Bike with name ${bikeName} not found.`;
      }

      const chain = bike.chains.find((c) => c.name === chainName);
      if (!chain) {
        return `Chain with name ${chainName} not found for bike ${bikeName}.`;
      }

      bike.chains.forEach((c) => (c.isActive = false)); // Deactivate all chains
      chain.isActive = true; // Activate the specified chain
      await bike.save();

      return `Chain ${chainName} is now the active chain for bike ${bikeName}.`;
    } catch (error) {
      console.error(error);
      return 'An error occurred while setting the active chain.';
    }
  },
};