import { Op } from 'sequelize';

export async function retireInactiveBikes(BikesTable, userId, activeBikeIds) {
  await BikesTable.update(
    { retired: true },
    {
      where: {
        userId,
        retired: false,
        ...(activeBikeIds.length ? { bikeId: { [Op.notIn]: activeBikeIds } } : {})
      }
    }
  );
}
