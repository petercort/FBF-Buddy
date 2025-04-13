export default (sequelize, DataTypes) => {
	return sequelize.define('users', {
        userId: {
            type: DataTypes.STRING,
            primaryKey: true,
            Unique: true,
        },
        strava_user_id: DataTypes.STRING,
        strava_access_token: DataTypes.TEXT,
        strava_connected: DataTypes.BOOLEAN,
        strava_refresh_token: DataTypes.TEXT,
        strava_expires_at: DataTypes.INTEGER,
    });
};