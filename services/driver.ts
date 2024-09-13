import bcrypt from 'bcryptjs';
import Driver from "../models/Driver.model";
import ActiveRoutes from "../models/ActiveRoutes.model";
import { CreateDriverProps, LoginDriverProps, UpdateDriverProps } from "../utils/types";
import jwt from 'jsonwebtoken';

export const getAllActiveDriversService = async () => {
    try {
        const activeDrivers = await ActiveRoutes.findAll({})
        return activeDrivers ? activeDrivers : null;
    } catch (error) { throw error; }
}

export const getAllDriversService = async () => {
    try {
        const allDrivers = await Driver.findAll({})
        return allDrivers ? allDrivers : null;
    } catch (error) { throw error; }
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

export const updateDriverService = async (driverId: string, updateData: UpdateDriverProps) => {
    try {
        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            throw new Error("Driver not found");
        }
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        await driver.update(updateData);

        return driver;
    } catch (error) {
        throw error; // Rethrow the error to be handled by the controller
    }
};


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
            role: "DRIVER"
        }
        const token = jwt.sign(userSessionData, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        return { data: { ...userData }, token };
    } catch (error) {
        throw error;
    }
}

export const deleteDriverService = async (driverId: string): Promise<number> => {
    try {
        const deletedCount = await Driver.destroy({ where: { id: driverId } });
        return deletedCount;
    } catch (error) {
          console.error('Error deleting driver:', error);
        throw new Error(`Failed to delete driver: ${error}`);
    }
};