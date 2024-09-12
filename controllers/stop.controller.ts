import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { checkPermissionService } from "../services/role";
import { actions, resources } from "../config/constants";
import { createCsvStopService } from "../services/stops";
import moment from "moment";

export const createCsvStop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { role } = req.user;
        const permission = await checkPermissionService(role.id, resources.CSV, actions.CREATE);
        if (!permission) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create a CSV stop'
            });
            return;
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'No file uploaded or file is empty', error: true });
        }

        const fileBuffer = req.file.buffer;
        const date = typeof req.query.date === 'string' ? req.query.date : moment().format('YYYY-MM-DD');
        const newStops = await createCsvStopService(fileBuffer, date)
        res.status(200).json(newStops)
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create CSV stop', error: error.message });
    }
}