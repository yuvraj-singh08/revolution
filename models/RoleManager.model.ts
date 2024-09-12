import { DataTypes } from 'sequelize';
import { sequelize } from '.';

const RoleManager = sequelize.define('role_manager', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    adminId: {
        type: DataTypes.UUID,
        references: {
            model: 'admins',
            key: 'id',
        },
    },
    roleId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Roles',
            key: 'id',
        },
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['adminId'],  // Unique index on the email field
        },
    ],
    tableName: 'role_manager',
})

export default RoleManager;