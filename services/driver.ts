import bcrypt from 'bcryptjs';
import Driver from "../models/Driver.model";
import ActiveRoutes from "../models/ActiveRoutes.model";
import { CreateDriverProps, LoginDriverProps } from "../utils/types";
import jwt from 'jsonwebtoken';

export const getAllActiveDriversService = async () => {
    try {
        const activeDrivers = await ActiveRoutes.findAll({})
        return activeDrivers ? activeDrivers : null;
} catch (error) {
    throw error;
}

}

export const createDriverService = async ({ email, name, password }: CreateDriverProps) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newDriver = await Driver.create({
            email,
            name,
            password: passwordHash,
        })
        if (!newDriver) {
            throw new Error("Failed to create driver");
        }
        return newDriver;
    } catch (error) {
        throw error;
    }
}

export const loginDriverService = async ({ email, password }: LoginDriverProps) => {
    try {
        const user = await Driver.findOne({
            where: { email },
        })
        if (!user) {
            throw new Error("Driver does not exist")
        }
        const isPasswordMatch = await bcrypt.compare(password, user.get("password") as unknown as string);
        if (!isPasswordMatch) {
            throw new Error("Invalid password")
        }

        const SECRET_KEY = process.env.SECRET_KEY || 'cleanclean';
        const userData = user.get() as unknown as any;
        delete userData.password
        const userSessionData = {
            id: user.get("id"),
            name: user.get("name"),
            email: user.get("email"),
        }
        const token = jwt.sign(userSessionData, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        return { data: { ...userData }, token };
    } catch (error) {
        throw error;
    }
}