export default (sequelize, DataTypes) => {
	return sequelize.define('bikes', {
    bikeId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        
        references: {
            model: 'users',
            key: 'userId'
        }
    },
    name: {
        type: DataTypes.STRING,
    },
    brand: {
        type: DataTypes.STRING,
    },
    model: {
        type: DataTypes.STRING,
    },
    distance: {
        type: DataTypes.INTEGER,
    },
    lastWaxedDate: {
        type: DataTypes.STRING,
        defaultValue: 'NEVER',
    },
    lastWaxedDistance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    chains: [
      {
        name: DataTypes.STRING, // Name of the chain
        mileage: DataTypes.INTEGER, // Mileage of the chain
        isActive: DataTypes.BOOLEAN, // Whether this chain is currently active
        wearMeasurements: [
          {
            measurement: DataTypes.INTEGER, // Percentage wear
            mileage: DataTypes.INTEGER, // Mileage at the time of measurement
          },
        ],
      },
    ],
  })
};