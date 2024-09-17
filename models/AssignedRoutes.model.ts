import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '.';
import Route from './Route.model';
import Driver from './Driver.model';


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
            fields: ['routeId']  // Unique index on the email field
        },
    ],
    timestamps: true
});

AssignedRoute.belongsTo(Route, { foreignKey: 'routeId', as: 'assignedRoute' });
Route.hasMany(AssignedRoute, { foreignKey: 'routeId', as: 'assignedRoutes' });
AssignedRoute.belongsTo(Driver, { foreignKey: 'driverId', as: "assignedDriver" })
Driver.hasMany(AssignedRoute, { foreignKey: 'driverId', as: "assignedRoutes" })

export default AssignedRoute;
