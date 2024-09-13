import { NextFunction, Request, Response } from "express";
import { getRouteService } from "../services/route";
import { AuthenticatedRequest } from "../middleware/auth";
import { stopStatus } from "../config/constants";

export const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date, status, driverId, routeId } = req.query;
        if (!date || typeof date !== "string") {
            res.status(400).json({ success: false, message: "Missing required field 'date' or invalid date format" });
            return;
        }
        if (status && typeof status !== "string") {
            res.status(400).json({ success: false, message: "Invalid status format" });
            return;
        }
        if (status && status !== stopStatus.pending && status !== stopStatus.completed && status !== stopStatus.exceptionHandled && status !== stopStatus.exception) {
            res.status(400).json({ success: false, message: "Invalid Status Format" })
        }
        if (driverId && typeof driverId !== "string") {
            res.status(400).json({ success: false, message: "Invalid driverId format" });
            return;
        }
        if (routeId && typeof routeId !== "string") {
            res.status(400).json({ success: false, message: "Invalid routeId format" });
            return;
        }

        const routes = await getRouteService({ date, status, driverId, routeId });
        res.status(200).json({ success: true, ...routes });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message })
    }
}

export const getAssignedRoutes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {

    } catch (error) {

    }
}