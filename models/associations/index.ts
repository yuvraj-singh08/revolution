
import Admin from "../Admin.model";
import Driver from "../Driver.model";
import { Permissions, Resources, Roles } from "../Role.model.group";
import RoleManager from "../RoleManager.model";
import Route from "../Route.model";
import Stop from "../Stop.model";
import AssignedRoute from "../ActiveRoutes.model";
import ActiveRoutes from "../ActiveRoutes.model";


Permissions.belongsTo(Roles, { foreignKey: 'roleId', onDelete: 'CASCADE', as: 'role' });
Permissions.belongsTo(Resources, { foreignKey: 'resourceId', onDelete: 'CASCADE', as: 'resource' });

Roles.hasMany(Permissions, { foreignKey: 'roleId', as: 'permissions' });
Resources.hasMany(Permissions, { foreignKey: 'resourceId', as: 'permissions' });

// Admin has many RoleManager entries
Admin.hasOne(RoleManager, { foreignKey: 'adminId', as: 'assignedRoles' });

// RoleManager belongs to Admin
RoleManager.belongsTo(Admin, { foreignKey: 'adminId', onDelete: 'CASCADE', as: 'admin' });

RoleManager.belongsTo(Roles, { foreignKey: 'roleId', onDelete: 'CASCADE', as: "role" })
Roles.hasMany(RoleManager, { foreignKey: 'roleId', as: "assignedTo" })


//Route and Stop Association
Route.hasMany(Stop, { foreignKey: 'routeId', as: 'stops' });
Stop.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });


// Driver and Stop association
Driver.hasMany(Stop, { foreignKey: 'markedBy', as: 'driverStops' }); // A Driver can complete many Stops
Stop.belongsTo(Driver, { foreignKey: 'markedBy', as: 'driver' }); // A Stop is completed by a Driver



// Assigned Routes Association
// AssignedRoute.belongsTo(Driver, { foreignKey: 'driverId', as: "assignedDriver" })
// AssignedRoute.belongsTo(Route, { foreignKey: 'routeId', as: "assignedRoute" })
// Driver.hasMany(AssignedRoute, { foreignKey: 'driverId', as: "assignedRoutes" })
// Route.hasMany(AssignedRoute, { foreignKey: 'routeId', as: "assignedDriver" })
