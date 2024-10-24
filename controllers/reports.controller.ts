import * as dotenv from 'dotenv';
import { NextFunction, Response } from "express";
import { getAllDriversReportService } from "../services/driver";
import { getAllRouteService } from "../services/route";
import { AuthenticatedRequest } from "../middleware/auth";
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();



export const getLog = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const log = await getLogData(req.body.Date);
        res.send(log);
    } catch (error) {
        next(error);
    }
};

export const getLogData = async (date: string, filterId?: string) => {
    const logFilePath = path.join(__dirname, '../middleware/logs', `${date}.json`);

    try {
        const data = await fs.promises.readFile(logFilePath, 'utf8');
        const logs = data.split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
        const filteredLogs = filterId ? logs.filter(log => log.id === filterId) : logs;
        return filteredLogs; // Return the filtered logs
    } catch (err) {
        console.error('Error reading log file:', err);
        throw err; // Rethrow the error to be caught in the calling function
    }
};

export const getReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (req.body.for == 'driver') {
            res.json(await getAllDriversReportService(req.body.from, req.body.to))
        } else if (req.body.for == 'routes') {
            res.json(await getAllRouteService(req.body.from, req.body.to))
        }
        else {
            res.json({ error: "unknow report requested" })
        }
    } catch (error) {
        next(error);
    }
}