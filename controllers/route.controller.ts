import { NextFunction, Request, Response } from "express";
import { assignRouteService, createActiveRouteService, finishRouteService, getActiveRoutesService, getAssignedRoutesService, getRouteService, leaveIncompleteRouteService, unAssignRouteService } from "../services/route";
import { AuthenticatedRequest } from "../middleware/auth";
import { resources, roles, stopStatus } from "../config/constants";
import { checkPermissionService } from "../services/role";
import HttpError from "../utils/httpError";

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

export const assignRoute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { routeId } = req.body;
        let driverId;
        const role = req.user.role;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
        }
        else {
            if (!(await checkPermissionService(role.id, resources.ROUTE, 'update'))) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to assign a route'
                });
                return;
            }
            driverId = req.body.driverId;
        }

        const assignedRoute = await assignRouteService({ driverId, routeId });
        res.status(200).json({ success: true, data: assignedRoute });

    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

export const getAssignedRoutes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const date = req.query.date;
        let driverId;
        const role = req.user.role;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
        }
        else {
            if (!(await checkPermissionService(role.id, resources.ROUTE, 'update'))) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to assign a route'
                });
                return;
            }
            driverId = req.query.driverId;

        }

        if (driverId && typeof driverId !== "string") {
            res.status(400).json({ success: false, message: "Missing required field 'driverId' or invalid driverId format" });
            return;
        }
        if (date && typeof date !== "string") {
            res.status(400).json({ success: false, message: "Missing required field 'date' or invalid date format" });
            return;
        }
        const assignedRoutes = await getAssignedRoutesService(driverId, date);
        res.status(200).json({ success: true, ...assignedRoutes });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const createActiveRoutes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const routeId = req.body.routeId;
        let driverId;
        const role = req.user.role;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
        }
        else {
            if (!(await checkPermissionService(role.id, resources.ROUTE, 'update'))) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to assign a route'
                });
                return;
            }
            driverId = req.body.driverId;
        }

        const activeRoute = await createActiveRouteService(driverId, routeId);
        res.status(201).json({ success: true, data: activeRoute });

    } catch (error) {
        next(error);
    }
}

export const getActiveRoutes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        let driverId;
        const role = req.user.role;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
        }
        else {
            if (!(await checkPermissionService(role.id, resources.ROUTE, 'update'))) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to assign a route'
                });
                return;
            }
            driverId = req.query.driverId;
        }

        if (driverId && typeof driverId !== "string") {
            res.status(400).json({ success: false, message: "Missing required field 'driverId' or invalid driverId format" });
            return;
        }

        const activeRoutes = await getActiveRoutesService(driverId);
        res.status(200).json({ success: true, data: activeRoutes });

    } catch (error) {
        next(error);
    }
}

export const finishRoute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const routeId = req.body.routeId;
        let driverId;
        const role = req.user.role;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
        }
        else {
            if (!(await checkPermissionService(role.id, resources.ROUTE, 'update'))) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to assign a route'
                });
                return;
            }
        }

        const finishRoute = await finishRouteService(driverId, routeId);
        res.status(200).json({ success: true, data: finishRoute });

    } catch (error) {
        next(error);
    }
}

export const unassignRoute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const routeId = req.body.routeId;
        let driverId;
        const role = req.user.role;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
        }
        else {
            if (!(await checkPermissionService(role.id, resources.ROUTE, 'update'))) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to assign a route'
                });
                return;
            }
        }

        const destroy = await unAssignRouteService(driverId, routeId);
        res.status(200).json({ success: true, data: destroy });

    } catch (error) {
        next(error);
    }
}

export const leaveIncompleteRoute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const routeId = req.body.routeId;
        if (!routeId) {
            throw new HttpError("routeId missing in the request", 400);
        }
        let driverId;
        const role = req.user.role;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
        }
        else {
            if (!(await checkPermissionService(role.id, resources.ROUTE, 'update'))) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions form managing routes'
                });
                return;
            }
        }

        const leaveRoute = await leaveIncompleteRouteService(driverId, routeId);
        res.status(200).json({ success: true, data: leaveRoute });
    } catch (error) {
        next(error);
    }
}