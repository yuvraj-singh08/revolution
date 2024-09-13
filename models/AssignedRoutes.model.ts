// import { DataTypes, Sequelize } from 'sequelize';
// import { sequelize } from '.';


// const AssignedRoute = sequelize.define('assigned_route', {
//     id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
//         allowNull: false,
//         primaryKey: true,
//     },
//     routeId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     status: {
//         type: DataTypes.ENUM('PENDING', 'COMPLETED'),
//         defaultValue: 'PENDING',
//     },
//     completionTime: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     uploadDate: {
//         type: DataTypes.DATEONLY,
//         defaultValue: DataTypes.NOW,
//     }
// }, {
//     tableName: 'routes',    // Define table name explicitly
//     indexes: [
//         {
//             unique: true,
//             fields: ['routeId', 'uploadDate']  // Unique index on the email field
//         },
//     ],
//     timestamps: true
// });

// export default AssignedRoute;
