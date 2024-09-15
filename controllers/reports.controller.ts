import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from "express";
import { getAllDriversReportService } from "../services/driver";
import { getAllRouteService } from "../services/route";
import { AuthenticatedRequest } from "../middleware/auth";
import { actions, resources, roles } from "../config/constants";

dotenv.config();

export const getReport = async (req: AuthenticatedRequest, res: Response) => {
    if(req.body.for == 'driver'){
        res.json(await getAllDriversReportService(req.body.from, req.body.to))
    }else if(req.body.for == 'routes'){
        res.json(await getAllRouteService(req.body.from, req.body.to))
    }
    else{
        res.json({error:"unknow report requested"})
    }
}
