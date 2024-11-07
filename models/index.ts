import { Sequelize } from 'sequelize';
import { config } from '../config/db.config'; // Adjust path as needed

const env = 'development';
const { db } = config[env];

// Initialize Sequelize without a database to create the database
export const sequelize = new Sequelize(db.database as string, db.username as string, db.password, {
    host: db.host,
    dialect: 'mysql',
    port: db.port ?? 3306,
    pool: {
        max: 10,
        min: 0,
        acquire: 50000,
        idle: 10000,
    },
    logging: false,
    retry: {
        max: 3,
    },
    dialectOptions: {
        connectTimeout: 60000, // 60 seconds
    },
});
