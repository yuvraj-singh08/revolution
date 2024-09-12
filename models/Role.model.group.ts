import { DataTypes } from 'sequelize';
import { sequelize } from '.';

const ActionEnum = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete'
};

export const Roles = sequelize.define('Roles', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    }
}, {
    tableName: 'Roles',
    timestamps: true,
    indexes: [
        {
          unique: true,
          name: 'name',
          fields: ['name'], // Explicitly creating a unique index on name
        },
      ],
});

export const Resources = sequelize.define('Resources', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    }
}, {
    tableName: 'Resources',
    timestamps: true,
    indexes: [
        {
          unique: true,
          name: 'name',
          fields: ['name'], // Explicitly creating a unique index on name
        },
      ],
})

export const Permissions = sequelize.define('Permissions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    roleId: {
        type: DataTypes.INTEGER,
        references: {
            model: Roles,
            key: 'id'
        },
        allowNull: false
    },
    resourceId: {
        type: DataTypes.INTEGER,
        references: {
            model: Resources,
            key: 'id'
        },
        allowNull: false,
    },
    action: {
        type: DataTypes.ENUM(...Object.values(ActionEnum)),
        allowNull: false,
    }
}, {
    tableName: 'Permissions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['roleId', 'resourceId', 'action'],
        },
    ],
})

// Relationships
Permissions.belongsTo(Roles, { foreignKey: 'roleId', onDelete: 'CASCADE' });
Permissions.belongsTo(Resources, { foreignKey: 'resourceId', onDelete: 'CASCADE' });