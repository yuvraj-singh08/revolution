import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from "express";
import {
    createDriverService,
    loginDriverService,
    updateDriverService,
    deleteDriverService,
    getAllActiveDriversService,
    getAllDriversService
} from "../services/driver";
import { checkPermissionService } from "../services/role";
import { AuthenticatedRequest } from "../middleware/auth";
import { actions, resources } from "../config/constants";
import { createTransport } from 'nodemailer';
dotenv.config();
export const getAllActiveDrivers  = async (req: AuthenticatedRequest, res: Response) => {
    res.json(await getAllActiveDriversService())
}

export const getAllDrivers  = async (req: AuthenticatedRequest, res: Response) => {
    res.json(await getAllDriversService())
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
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const createdDriver = await createDriverService({ email, password, name });
 // Send registration email
//  const transporter = createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.MAILER_ID,
//         pass: process.env.MAILER_KEY
//     }
// });

// const mailOptions = {
//     from: process.env.MAILER_ID,
//     to: req.body.email,
//     subject: 'Registration Successful',
//     text: `Hello ${ req.body.name }, \n\nYour registration was successful!\n\nHere are your credentials: \n\nEmail: ${ req.body.email }\nPassword: ${ req.body.password }\n\nPlease change your password after logging in.\n\nBest regards, \nYour Company`
// };

// // Send the email and commit only if the email is sent successfully
// transporter.sendMail(mailOptions, async (error: Error | null, info: { response: string }) => {
//     if (error) {
//         console.log('Error sending email:', error);
//         return res.send({ message: 'Registration successful, but failed to send email', error: true });
//     } else {
//         console.log('Email sent:', info.response);
//         return res.send({ message: 'Registration successful and email sent', error: false });
//     }
// });


        return res.status(201).json({ success: true, message: "Created New Driver", data: createdDriver });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message, message: "Failed to create driver" });
    }
}

export const loginDriver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await loginDriverService({ email, password });
        res.status(201).json({ success: true, message: "LogIn Successful", ...user});
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, message: "Failed to Login" });
    }
}

export const editDriver = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { role } = req.user;
        const permission = await checkPermissionService(role.id, resources.DRIVER, actions.UPDATE);

        if (!permission) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to edit a driver'
            });
        }

        const { licenseNo, name, ssnNo, dob, driverType, status, mobileNo, email, driverId } = req.body;

        if (!driverId) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        const updatedDriver = await updateDriverService(driverId, {
            licenseNo,
            name,
            ssnNo,
            dob,
            driverType,
            status,
            mobileNo,
            email,
        });

        if (!updatedDriver) {
            return res.status(404).json({ success: false, message: "Driver not found or update failed" });
        }
        return res.status(200).json({ success: true, error: false, data: updatedDriver });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message, message: "Failed to edit driver" });
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
        return res.send({ message: 'Driver has been deleted', success: true, error: false });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: `Error: ${error.message}`, error: true, success: false });
    }
};
