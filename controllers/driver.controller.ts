import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from "express";
import {
    createDriverService,
    loginDriverService,
    updateDriverService,
    deleteDriverService,
    getAllActiveDriversService,
    getAllDriversService,
    getDriverDetailService,
    updateDriverStatusService,
    getLocationService,
    setLocationService
} from "../services/driver";
import Logger from '../middleware/Logger'
import { checkPermissionService } from "../services/role";
import { AuthenticatedRequest } from "../middleware/auth";
import { actions, resources, roles } from "../config/constants";
import { createTransport } from 'nodemailer';
import Driver from '../models/Driver.model';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

const filePath = path.join(__dirname, '../config/notPickedUpList.txt');
dotenv.config();
const logger = new Logger();

// Function to read the list from the text file
const readListFromFile = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            // Split by newline and filter out empty lines
            resolve(data.split('\n').filter(item => item.trim() !== ''));
        });
    });
};

// Function to write the list to the text file
const writeListToFile = async (list: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, list.join('\n'), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

export const GetNotPickedUpList = async (req: Request, res: Response): Promise<void> => {
    try {
        const list = await readListFromFile();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read the list.' });
    }
};

export const AddNotPickedUpList = async (req: Request, res: Response): Promise<void> => {
    const { item }: { item?: string } = req.body;

    if (!item) {
        res.status(400).json({ error: 'Item is required.' });
        return;
    }

    try {
        const list = await readListFromFile();
        list.push(item);
        await writeListToFile(list);
        res.json({ message: 'Item added successfully.', list });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item.' });
    }
};

export const DeleteNotPickedUpList = async (req: Request, res: Response): Promise<void> => {
    const { item }: { item?: string } = req.body;

    if (!item) {
        res.status(400).json({ error: 'Item is required.' });
        return;
    }

    try {
        let list = await readListFromFile();
        list = list.filter(existingItem => existingItem !== item);
        await writeListToFile(list);
        res.json({ message: 'Item removed successfully.', list });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item.' });
    }
};

export const getAllActiveDrivers = async (req: AuthenticatedRequest, res: Response) => {
    res.json(await getAllActiveDriversService())
}

export const driverPasswordResetRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { email, phone } = req.body;
        if (!email && !phone) {
            res.status(400).json({
                error: true,
                message: 'Email or phone is required'
            })
            return;
        }
        const driver = await Driver.findOne({
            where: {
                [Op.or]: [
                    { phone: phone || "" },
                    { email: email || "" }
                ]
            }
        })
        if (!driver) {
            res.status(404).json({
                error: true,
                message: 'Driver not found',
            })
            return;
        }
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILER_ID,
                pass: process.env.MAILER_KEY
            }
        });

        const mailOptions = {
            from: process.env.MAILER_ID,
            to: process.env.ADMIN_MAIL,
            subject: 'Password Reset Request',
            text: `Hello Admin, \n\nA password reset Request has been raised by user with Email: ${email}\n\nPlease change their password.`
        };

        // Send the email and commit only if the email is sent successfully
        transporter.sendMail(mailOptions, async (error: Error | null, info: { response: string }) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.send({ message: 'Failed to send Email', error: true });
            } else {
                console.log('Email sent:', info.response);
                logger.logEvent('DRIVER_ACTION', `Driver Password Reset Requested for ${req.body.email}`);
                return res.send({ message: 'Password Reset Request Sent', error: false });
            }
        });
    } catch (error) {
        next(error);
    }

}

export const updateStatusDriver = async (req: AuthenticatedRequest, res: Response) => {
    logger.logEvent('DRIVER_ACTION', `Driver Status Updated for ${req.body.id} to ${req.body.status}`);
    res.json(await updateDriverStatusService(req.body.id, req.body.status))
}


export const getAllDrivers = async (req: AuthenticatedRequest, res: Response) => {
    res.json(await getAllDriversService())
}

export const setDriverLocation = async (req: AuthenticatedRequest, res: Response) => {
    res.json(await setLocationService(req.body.id, req.body.coords))
}

export const getDriverLocation = async (req: AuthenticatedRequest, res: Response) => {
    res.json(await getLocationService(req.body.id))
}


export const getDriverDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
        if (!driverId || typeof driverId !== "string") {
            res.status(400).json({ success: false, message: "Invalid driverId format" });
            return;
        }

        const driverDetails = await getDriverDetailService(driverId);
        res.status(200).json({ success: true, data: driverDetails });

    } catch (error: any) {
        console.error(error);
        next(error);
    }
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
        const { email, password, phone, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (phone && phone.length != 10) {
            return res.status(400).json({ error: "Invalid phone number" });
        }
        const createdDriver = await createDriverService({ email, password, phone, name });
        // Send registration email
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILER_ID,
                pass: process.env.MAILER_KEY
            }
        });

        const mailOptions = {
            from: process.env.MAILER_ID,
            to: req.body.email,
            subject: 'Registration Successful',
            text: `Hello ${req.body.name}, \n\nYour registration was successful!\n\nHere are your credentials: \n\nEmail: ${req.body.email}\nPassword: ${req.body.password}\n\nPlease change your password after logging in.\n\nBest regards, \nYour Company`
        };

        // Send the email and commit only if the email is sent successfully
        transporter.sendMail(mailOptions, async (error: Error | null, info: { response: string }) => {
            if (error) {
                console.log('Error sending email:', error);
                // return res.send({ message: 'Registration successful, but failed to send email', error: true });
            } else {
                console.log('Email sent:', info.response);
                // return res.send({ message: 'Registration successful and email sent', error: false });
            }
        });

        logger.logEvent('DRIVER_ACTION', `Driver Created with email ${req.body.email}`);
        return res.status(201).json({ success: true, message: "Created New Driver", data: createdDriver });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message, message: "Failed to create driver" });
    }
}

export const loginDriver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, phone, password } = req.body;
        if ((!email && !phone) || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await loginDriverService({ email, phone, password });
        logger.logEvent('DRIVER_ACTION', `Driver logged in with email ${email}`);
        res.status(200).json({ success: true, message: "LogIn Successful", ...user });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to Login" });
    }
}

export const editDriver = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { role } = req.user;
        const updateData = req.body;
        let driverId;
        if (role === roles.DRIVER) {
            driverId = req.user.id;
            delete updateData.id;
            delete updateData.password;
        }
        else {
            const permission = await checkPermissionService(role.id, resources.DRIVER, actions.UPDATE);

            if (!permission) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to edit a driver'
                });
                return;
            }
            driverId = req.body.driverId;
        }



        if (!driverId) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        const PTpass = req.body.password;
        const updatedDriver = await updateDriverService(driverId, updateData);

        if (!updatedDriver) {
            return res.status(404).json({ success: false, message: "Driver not found or update failed" });
        }


        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILER_ID,
                pass: process.env.MAILER_KEY
            }
        });

        const mailOptions = {
            from: process.env.MAILER_ID,
            to: updatedDriver.dataValues.email,
            subject: 'Password Reset Successful',
            text: `Hello ${req.body.name}, \n\nYour Password was successfully Reset!\n\nHere is the new Password: ${PTpass}`
        };

        transporter.sendMail(mailOptions, async (error: Error | null, info: { response: string }) => {
            if (error) {
                console.log('Error sending email:', error);
                // return res.send({ message: 'Registration successful, but failed to send email', error: true });
            } else {
                console.log('Email sent:', info.response);
                logger.logEvent('DRIVER_ACTION', `Driver Updated for ${updatedDriver.dataValues.email}`);
                return res.status(200).json({ success: true, error: false, data: updatedDriver });
            }
        });
    } catch (error: any) {
        console.error(error);
        // return res.status(500).json({ success: false, error: error.message, message: "Failed to edit driver" });
        next(error);
    }
};

export const deleteDriver = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.body;
        if (typeof id !== 'string' || !id) {
            return res.status(400).json({ message: 'Invalid driver ID', success: false, error: true });
        }
        const deletedCount = await deleteDriverService(id);
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Driver not found', success: false, error: true });
        }
        logger.logEvent('DRIVER_ACTION', `Driver Deleted with id ${id}`);
        return res.send({ message: 'Driver has been deleted', success: true, error: false });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: `Error: ${error.message}`, error: true, success: false });
    }
};
