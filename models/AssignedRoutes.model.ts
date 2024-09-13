import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '.';


const AssignedRoute = sequelize.define('assigned_routes', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
        allowNull: false,
        primaryKey: true,
    },
    routeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'routes',
            key: 'id',
        }
    },
    driverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'drivers',
            key: 'id',
        }
    }
}, {
    tableName: 'assigned_routes',    // Define table name explicitly
    indexes: [
        {
            unique: true,
            fields: ['routeId', 'driverId']  // Unique index on the email field
        },
        {
            unique: true,
            fields: ['routeId']  // Unique index on the email field
        },
    ],
    timestamps: true
});

export default AssignedRoute;
