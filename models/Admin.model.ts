import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '.';

// Initialize Sequelize instance (assuming you already have a connection setup)

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
        allowNull: false,
        primaryKey: true,
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
    socketId: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'admins',    // Define table name explicitly
    indexes: [
        {
            unique: true,
            fields: ['email']  // Unique index on the email field
        },
    ],
    timestamps: true        
});

export default Admin;
