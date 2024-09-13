import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { checkPermissionService } from "../services/role";
import { actions, resources } from "../config/constants";
import { createCsvStopService, updateBulkStopService, updateStopService } from "../services/stops";
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
        res.status(200).json({
            success: true,
            ...newStops,
            message: 'CSV stop created successfully'
        })
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create CSV stop', error: error.message });
    }
}

export const updateBulkStop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { data } = req.body;
        const { role } = req.user;

        const updateStops = await updateBulkStopService(data);
        res.status(200).json({
            success: true,
            data: updateStops,
            message: 'Bulk stop updated successfully'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Failed to update bulk stop',
            error: error.message
        })
    }
}

export const updateStop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { data } = req.body;
        const { role } = req.user;

        const updateStops = await updateStopService(data);
        res.status(200).json({
            success: true,
            data: updateStops,
            message: 'Stop updated successfully'
        });
    } catch (error: any) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update bulk stop',
            error: error.message
        })
    }
}