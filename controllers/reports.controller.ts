import * as dotenv from 'dotenv';
import { NextFunction, Response } from "express";
import { getAllDriversReportService } from "../services/driver";
import { getAllRouteService } from "../services/route";
import { AuthenticatedRequest } from "../middleware/auth";
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

export const getLog = async (date: string, filterId?: string)=> {
    const logFilePath = path.join(__dirname, 'logs', `${date}.json`);

    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return;
        }
        const logs = data.split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));

        const filteredLogs = filterId ? logs.filter(log => log.id === filterId) : logs;
        console.log(filteredLogs);
    });
}



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
