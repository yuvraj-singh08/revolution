import { NextFunction, Request, Response } from "express";
import { addPermissionService, addResourceService, addUserRoleService, assignRoleService } from "../services/role";

export const addUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.body;
        if (role === undefined) {
            res.status(400).json({ success: false, message: 'role required' })
            return;
        }
        const newRole = await addUserRoleService(role);
        res.status(200).json({ success: true, data: newRole });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to create new role" });
    }
}

export const addResource = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { resource } = req.body;
        if (resource === undefined) {
            res.status(400).json({ success: false, message: 'resource required' })
            return;
        }
        const newResource = await addResourceService(resource);
        res.status(200).json({ success: true, data: newResource });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to add resource" });
    }
}

export const addPermission = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { roleId, resourceId, actions } = req.body;
        if (roleId === undefined || resourceId === undefined || actions === undefined) {
            res.status(400).json({ success: false, message: 'roleId, resourceId and actions required' })
            return;
        }
        const newPermissions = await addPermissionService(roleId, resourceId, actions);
        res.status(200).json({ success: true, data: newPermissions });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to add permission" });
    }
}

export const assignRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { adminId, roleId } = req.body
        if (adminId === undefined || roleId === undefined) {
            res.status(400).json({ success: false, message: 'adminId and roleId required' })
            return;
        }
        const assignedRole = await assignRoleService(adminId, roleId);
        res.status(200).json({ success: true, message: "Assigned Role Successfully", data: assignedRole });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to assign role" });
    }
}