import bcrypt from 'bcryptjs';
import Driver from "../models/Driver.model";
import { CreateDriverProps } from "../utils/types";

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