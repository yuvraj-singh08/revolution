import { DataTypes } from 'sequelize';
import { sequelize } from '.'; // Adjust the path as necessary
import { stopStatus } from '../config/constants';

const Stop = sequelize.define('Stop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Automatically generates a UUID
        allowNull: false,
        primaryKey: true,
    },
    routeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'routes', // The table to reference
            key: 'id',        // The column to reference
        },
    },
    stopId: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(stopStatus)), // Add all possible statuses for stop_status
        allowNull: false,
        defaultValue: stopStatus.pending
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    truckNo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    markedBy: {
        type: DataTypes.UUID,
        references: {
            model: 'drivers',  // The table to reference
            key: 'id',         // The column to reference
        },
        allowNull: true,
    },
    markedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    uploadDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    serveAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    serveName: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    serveQty: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    serveType: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    accountNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    containerId: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    workType: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    oneTimePickup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'stops',   // Name of the table
    indexes: [
        {
            unique: true,
            fields: ['uploadDate', 'latitude', 'longitude'], // Unique constraint on these fields
        }
    ],
    timestamps: false,     // If you want Sequelize to manage `createdAt` and `updatedAt`
});

export default Stop;
