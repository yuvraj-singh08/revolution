import bcrypt from 'bcryptjs';
import Driver from "../models/Driver.model";
import ActiveRoutes from "../models/ActiveRoutes.model";
import { CreateDriverProps, LoginDriverProps, UpdateDriverProps, UpdateDriverStatusProps } from "../utils/types";
import jwt from 'jsonwebtoken';
import HttpError from '../utils/httpError';
import { roles } from '../config/constants';
import { where } from 'sequelize';
import { createClient } from 'redis';
const { Op } = require('sequelize');
require('dotenv').config();
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    }
});

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

async function connect() {
    try {
        await client.connect();
        console.log('Successfully connected to Redis');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}
connect();

async function setKeyValue(key: string, value: string) {
    try {
        await client.set(key, value);
        return true
    } catch (error) {
        console.error('Error setting key in Redis:', error);
    }
}

// Function to get a value for a given key from Redis
export async function getValue(key: string): Promise<string | null> {
    try {
        const value = await client.get(key);
        return value;
    } catch (error) {
        console.error('Error getting key from Redis:', error);
        return null;
    }
}



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

export const updateDriverStatusService = async (driverId: string, status: UpdateDriverStatusProps) => {
    try {
        await Driver.update({ status }, { where: { id: driverId } });
        const driver = await Driver.findByPk(driverId);
        return driver
    } catch (error) {
        throw error;
    }
}



export const getAllDriversReportService = async (startDate: string, endDate: string): Promise<any | null> => {
    try {
        const allDrivers = await Driver.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });
        return allDrivers.length > 0 ? allDrivers : null;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
};

export const getLocationService = async (driverID: string) => {
    return await getValue(driverID);
};

export const setLocationService = async (driverID: string, Coords: string) => {
    return await setKeyValue(driverID, Coords)
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
            role: roles.DRIVER
        }
        const token = jwt.sign(userSessionData, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        setKeyValue(`${userData.id}token`, token);
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

export const getDriverDetailService = async (driverId: string): Promise<any> => {
    try {
        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            throw new HttpError("Driver not found", 400);
        }
        return driver.get();
    } catch (error) {
        throw error;
    }
}