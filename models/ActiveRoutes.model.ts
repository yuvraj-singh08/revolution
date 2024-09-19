import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '.';
import Driver from './Driver.model';
import Route from './Route.model';

const ActiveRoutes = sequelize.define('activeRoutes', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    routeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'routes',
            key: 'id',
        },
    },
    driverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'drivers',
            key: 'id',
        }
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    finishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'activeRoutes',
    indexes: [
        {
            unique: true,
            fields: ['routeId']
        },
        {
            unique: true,
            fields: ['driverId']
        }
    ],
    timestamps: true,
});

//Active Routes Association
Driver.hasOne(ActiveRoutes, { foreignKey: 'driverId', as: "driver" })
Route.hasOne(ActiveRoutes, { foreignKey: 'routeId', as: "route" })
ActiveRoutes.belongsTo(Driver, { foreignKey: 'driverId', onDelete: 'CASCADE', as: "driver" })
ActiveRoutes.belongsTo(Route, { foreignKey: 'routeId', onDelete: 'CASCADE', as: "route" })

export default ActiveRoutes;