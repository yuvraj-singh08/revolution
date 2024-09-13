import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '.';

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
    driverId:{
        type: DataTypes.UUID,
        allowNull: false,
        references:{
            model: 'drivers',
            key: 'id',
        }
    },
 }, {
    tableName: 'activeRoutes',
    indexes: [
        {
            unique: true,
            fields: ['routeId']
        },
    ],
    timestamps: true,
});

export default ActiveRoutes;