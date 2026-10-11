import { Op } from 'sequelize';

export async function removeInactiveBikes(BikesTable, userId, activeBikeIds) {
  await BikesTable.destroy({
    where: activeBikeIds.length
      ? { userId, bikeId: { [Op.notIn]: activeBikeIds } }
      : { userId }
  });
}
