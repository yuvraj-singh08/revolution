import { NextFunction, Request, Response } from "express";
import { createAdminService, loginAdminService } from "../services/admin";
import Admin from "../models/Admin.model";

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const createdUser = await createAdminService({ email, password, name });
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
        res.status(201).json({ success: true, message: "LogIn Successful", ...user });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to Login" });
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