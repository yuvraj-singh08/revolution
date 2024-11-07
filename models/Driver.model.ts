import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '.';

// Initialize Sequelize instance (assuming you already have a connection setup)

const Driver = sequelize.define('Driver', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
        allowNull: false,
        primaryKey: true,
    },
    phone: {
        type: DataTypes.STRING(30),  // Use BIGINT for phone numbers
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Unique constraint
        validate: {
            isEmail: true,  // Validate email format
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    truckNo: {
        type: DataTypes.STRING,
    },
    socketId: {
        type: DataTypes.STRING,
    },
    lastLocation: {
        type: DataTypes.JSON,  // Store last location as JSON
    },
    status: {
        type: DataTypes.JSON,
        defaultValue:[]
    },
    active:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

}, {
    tableName: 'drivers',    // Define table name explicitly
    indexes: [
        {
            unique: true,
            fields: ['email']  // Unique index on the email field
        },
    ],
    timestamps: true      
});

export default Driver;
