import { NextFunction, Request, Response } from "express";
import { createAdminService, loginAdminService, updateAdminService, deleteAdminService } from "../services/admin";
import Logger from '../middleware/Logger'
import { checkPermissionService } from "../services/role";
import { AuthenticatedRequest } from "../middleware/auth";
import { actions, resources, roles } from "../config/constants";

import Admin from "../models/Admin.model";
const logger = new Logger();

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const createdUser = await createAdminService({ email, password, name });
        logger.logEvent('USER_ACTION', `Admin User Created with ${email}`);
        res.status(201).json({ success: true, message: "Created New Admin", data: createdUser });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to create Admin" });
    }
}

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await loginAdminService({ email, password });
        logger.logEvent('USER_ACTION', `Admin Login with email ${email}`);
        res.status(200).json({ success: true, message: "LogIn Successful", ...user });
    } catch (error: any) {
        console.error(error);
        next(error);
    }
}

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admins = await Admin.findAll();
        res.status(200).json({ success: true, data: admins });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Something went wrong" });
    }
}

export const editAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        let adminId = req.body.adminId;
        const updateData = req.body;
        // const { role } = req.user;
        // const updateData = req.body;
        // let adminId;
        // if (role === roles.ADMIN) {
        //     adminId = req.user.id;
        //     delete updateData.id;
        //     delete updateData.password;
        // }
        // else {
        //     const permission = await checkPermissionService(role.id, resources.ADMIN, actions.UPDATE);

        //     if (!permission) {
        //         res.status(403).json({
        //             success: false,
        //             message: 'Insufficient permissions to edit a driver'
        //         });
        //         return;
        //     }
        //     adminId = req.body.adminId;
        // }



        if (!adminId) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        const updatedAdmin = await updateAdminService(adminId, updateData);

        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found or update failed" });
        }
        logger.logEvent('USER_ACTION', `Admin User Updated with id ${adminId}`);
        return res.status(200).json({ success: true, error: false, data: updatedAdmin });

    } catch (error: any) {
        console.error(error);
        // return res.status(500).json({ success: false, error: error.message, message: "Failed to edit driver" });
        next(error);
    }
};

export const deleteAdmin = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.body;
        if (typeof id !== 'string' || !id) {
            return res.status(400).json({ message: 'Invalid Admin ID', success: false, error: true });
        }
        const deletedCount = await deleteAdminService(id);
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Admin not found', success: false, error: true });
        }
        logger.logEvent('USER_ACTION', `Admin User Deleted with id ${id}`);
        return res.send({ message: 'Admin has been deleted', success: true, error: false });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: `Error: ${error.message}`, error: true, success: false });
    }
};
