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
    retired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    lastWaxedDate: {
        type: DataTypes.STRING,
        defaultValue: 'NEVER',
    },
    lastWaxedDistance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
  })
};