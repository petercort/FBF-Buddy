export default (sequelize, DataTypes) => {
	return sequelize.define('events', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        location: DataTypes.STRING,
        link: DataTypes.TEXT,
        event_guide: DataTypes.TEXT,
        discipline: DataTypes.STRING,
        date: DataTypes.STRING,
        distances: DataTypes.STRING,
        registration_url: DataTypes.TEXT,
        active: DataTypes.BOOLEAN,
    });
};