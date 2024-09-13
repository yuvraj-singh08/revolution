
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
Driver.hasMany(Stop, { foreignKey: 'completedBy', as: 'driverStops' }); // A Driver can complete many Stops
Stop.belongsTo(Driver, { foreignKey: 'completedBy', as: 'driver' }); // A Stop is completed by a Driver

//Active Routes Association
Driver.hasOne(ActiveRoutes, { foreignKey: 'driverId', as: "driver" })
Route.hasOne(ActiveRoutes, { foreignKey: 'routeId', as: "route" })
ActiveRoutes.belongsTo(Driver, { foreignKey: 'driverId', onDelete: 'CASCADE', as: "driver" })
ActiveRoutes.belongsTo(Route, { foreignKey: 'routeId', onDelete: 'CASCADE', as: "route" })

// Assigned Routes Association
AssignedRoute.belongsTo(Driver, { foreignKey: 'driverId', as: "assignedDriver" })
AssignedRoute.belongsTo(Route, { foreignKey: 'routeId', as: "assignedRoute" })
Driver.hasMany(AssignedRoute, { foreignKey: 'driverId', as: "assignedRoutes" })
Route.hasOne(AssignedRoute, { foreignKey: 'routeId', as: "assignedDriver" })
