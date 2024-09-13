import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from "express";
import { createDriverService, loginDriverService, getAllActiveDriversService, getAllDriversService } from "../services/driver";
import { checkPermissionService } from "../services/role";
import { AuthenticatedRequest } from "../middleware/auth";
import { actions, resources } from "../config/constants";
import { createTransport } from 'nodemailer';
dotenv.config();
export const getAllActiveDrivers  = async (req: AuthenticatedRequest, res: Response) => {
    res.send(await getAllActiveDriversService())
}

export const getAllDrivers  = async (req: AuthenticatedRequest, res: Response) => {
    res.send(await getAllDriversService())
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
    text: `Hello ${ req.body.name }, \n\nYour registration was successful!\n\nHere are your credentials: \n\nEmail: ${ req.body.email }\nPassword: ${ req.body.password }\n\nPlease change your password after logging in.\n\nBest regards, \nYour Company`
};

// Send the email and commit only if the email is sent successfully
transporter.sendMail(mailOptions, async (error: Error | null, info: { response: string }) => {
    if (error) {
        console.log('Error sending email:', error);
        return res.send({ message: 'Registration successful, but failed to send email', error: true });
    } else {
        console.log('Email sent:', info.response);
        return res.send({ message: 'Registration successful and email sent', error: false });
    }
});


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