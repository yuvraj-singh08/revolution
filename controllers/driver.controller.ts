import { NextFunction, Request, Response } from "express";
import { createDriverService, loginDriverService, getAllActiveDriversService } from "../services/driver";
import { checkPermissionService } from "../services/role";
import { AuthenticatedRequest } from "../middleware/auth";
import { actions, resources } from "../config/constants";


export const getAllActiveDrivers  = async (req: AuthenticatedRequest, res: Response) => {
    
    res.send(await getAllActiveDriversService())
}

export const createDriver = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { role } = req.user
        const permission = await checkPermissionService(role.id, resources.DRIVER, actions.CREATE);
        if (!permission) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create a driver'
            })
            return;
        }
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const createdDriver = await createDriverService({ email, password, name });
        return res.status(201).json({ success: true, message: "Created New Driver", data: createdDriver });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message, message: "Failed to create driver" });
    }
}

export const loginDriver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await loginDriverService({ email, password });
        res.status(201).json({ success: true, message: "LogIn Successful", ...user});
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to Login" });
    }
}