import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '.';

// Initialize Sequelize instance (assuming you already have a connection setup)

const Chat = sequelize.define('Chat', {
    Mid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
        allowNull: false,
        primaryKey: true,
    },
    Uid: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Unique constraint
        validate: {
            isEmail: true,  // Validate email format
        },
    },
    socketId: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'Chat',
    indexes: [
        {
            unique: true,
            fields: ['Uid']
        },
    ],
    timestamps: true        
});

export default Chat;
