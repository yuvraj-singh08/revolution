
import Admin from "../Admin.model";
import { Permissions, Resources, Roles } from "../Role.model.group";
import RoleManager from "../RoleManager.model";


Permissions.belongsTo(Roles, { foreignKey: 'roleId', onDelete: 'CASCADE', as: 'role' });
Permissions.belongsTo(Resources, { foreignKey: 'resourceId', onDelete: 'CASCADE', as: 'resource' });

Roles.hasMany(Permissions, { foreignKey: 'roleId', as: 'permissions' });
Resources.hasMany(Permissions, { foreignKey: 'resourceId', as: 'permissions' });

// Admin has many RoleManager entries
Admin.hasOne(RoleManager, { foreignKey: 'adminId', as: 'assignedRoles' });

// RoleManager belongs to Admin
RoleManager.belongsTo(Admin, { foreignKey: 'adminId', onDelete: 'CASCADE', as: 'admin' });

RoleManager.belongsTo(Roles, {foreignKey: 'roleId', onDelete: 'CASCADE', as:"role"})
Roles.hasMany(RoleManager, {foreignKey:'roleId', as: "assignedTo"})