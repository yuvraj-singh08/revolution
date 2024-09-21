import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { checkPermissionService } from "../services/role";
import { actions, resources } from "../config/constants";
import { addStopService, createCsvStopService, getStopsService, updateBulkStopService, updateStopService, getStopImagesbyIdService } from "../services/stops";
import moment from "moment";
import HttpError from "../utils/httpError";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
  });
  
  

  export const imgUpload = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file || !req.body.stop) {
            return res.status(400).json({ success: false, message: 'required paramenters not provided' });
        }
        const fileExtension = path.extname(req.file.originalname);
        const formattedDate = (() => { const d = new Date(); return ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear().toString().slice(-2); })();
        const uniqueFilename = `${req.body.stop}-${formattedDate}${fileExtension}`;
        const bucketName = process.env.S3_BUCKET_NAME;
        const params = {
            Bucket: bucketName,
            Key: `${uniqueFilename}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        const signedUrlExpireSeconds = 60 * 60 * 24
        const url = await getSignedUrl(s3Client, command, { expiresIn: signedUrlExpireSeconds });
        let s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
        
        let currentImgBulk = await getStopImagesbyIdService(req.body.stop)     
        try {
            
            let currentImageUrl = currentImgBulk?.dataValues.imageUrl || '';
            let updatedImageUrl = currentImageUrl ? `${currentImageUrl},${s3Url}` : s3Url;
            
            let reqBody = {
                "id": req.body.stop,
                "imageUrl": updatedImageUrl
            };
           await updateStopService(reqBody);
        } catch (error: any) {
            console.log(error);
            res.status(400).json({
                success: false,
                message: 'Failed to update stop images',
                error: error.message
            })
        }
        return res.json({ 
            s3Url: s3Url
        });
    } catch (error) {
        console.error('Error in image upload:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

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
        //add checkPermission here and below
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

export const getStops = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { date, status } = req.query;
        if (date && typeof date !== 'string') {
            throw new HttpError("Invalid date format", 400);
        }
        if (status && typeof status !== 'string') {
            throw new HttpError("Invalid status format", 400);
        }
        const stops = await getStopsService(date, status);
        res.status(200).json({
            success: true,
            data: stops,
            message: 'Stops fetched successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const addStop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { role } = req.user;
        const permission = await checkPermissionService(role.id, resources.CSV, actions.CREATE);
        if (!permission) {
            throw new HttpError("Insufficient permissions to add a stop", 400);
        }
        const {
            routeId,
            latitude,
            date,
            longitude,
            status,
            stopId,
            serveAddress,
            accountNumber,
        } = req.body

        if (routeId === undefined || latitude === undefined || longitude === undefined || date === undefined || status === undefined || stopId === undefined || accountNumber === undefined) {
            throw new HttpError("Missing required fields", 400);
        }

        const newStop = await addStopService({ routeId, latitude, longitude, date, status, stopId, serveAddress, accountNumber })
        res.status(201).json({ success: true, data: newStop })
    } catch (error) {
        next(error);
    }
}