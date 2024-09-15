import { Permissions, Resources, Roles } from "../models/Role.model.group";
import RoleManager from "../models/RoleManager.model";
import { UserActionType } from "../utils/types";

export const addUserRoleService = async (role: string) => {
    try {
        const newRole = await Roles.create({
            name: role,
        })
        return newRole;
    } catch (error) {
        throw error;
    }
}

export const addResourceService = async (resource: string) => {
    try {
        const newResource = await Resources.create({
            name: resource,
        });
        return newResource;
    } catch (error) {
        throw error;
    }
}

export const addPermissionService = async (roleId: number, resourceId: number, actions: UserActionType[]) => {
    try {
        const permissions = actions.map((action) => {
            return {
                roleId,
                resourceId,
                action,
            }
        })
        const newPermissions = await Permissions.bulkCreate(permissions);
        return newPermissions;
    } catch (error) {
        throw error
    }
}

export const getAllResourceService = async () => {
    try {
        const resources = await Resources.findAll();
        return resources;
    } catch (error) {
        throw error;
    }
}

export const checkPermissionService = async (roleId: number, resourceName: string, action: string) => {
    try {
        const permission = await Permissions.findOne({
            include: [
                {
                    model: Resources,
                    where: { name: resourceName },
                    attributes: [], // We don't need any fields from Resources
                },
            ],
            where: {
                roleId: roleId,
                action: action,
            },
        });
        if (!permission)
            return false
        return true; // Returns true if permission exists, false otherwise
    } catch (error) {
        throw error;
    }
}

export const assignRoleService = async (adminId: string, roleId: number) => {
    try {
        const assignedRole = await RoleManager.create({
            adminId,
            roleId,
        });
        if (!assignedRole) {
            throw new Error("Failed to assign role");
        }
        return assignedRole;
    } catch (error) {
        throw error;
    }
}