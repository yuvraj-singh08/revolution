import bcrypt from 'bcryptjs';
import Admin from "../models/Admin.model";
import { CreateAdminProps, LoginAdminProps, UpdateAdminProps } from "../utils/types";
import RoleManager from '../models/RoleManager.model';
import { Roles } from '../models/Role.model.group';
import jwt from 'jsonwebtoken';

export const createAdminService = async ({ email, password, name }: CreateAdminProps) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newAdmin = await Admin.create({
            email,
            name,
            password: passwordHash,
        })
        if (!newAdmin) {
            throw new Error("Failed to create admin");
        }
        return newAdmin;
    } catch (error) {
        throw error;
    }
}

export const loginAdminService = async ({ email, password }: LoginAdminProps) => {
    try {
        const user = await Admin.findOne({
            where: { email },
        })
        if (!user) {
            throw new Error("User does not exist")
        }
        const isPasswordMatch = await bcrypt.compare(password, user.get("password") as unknown as string);
        if (!isPasswordMatch) {
            throw new Error("Invalid password")
        }

        const SECRET_KEY = process.env.SECRET_KEY || 'cleanclean';
        const userRole = await RoleManager.findOne({
            where: {
                adminId: user.get("id")
            },
            include: [
                {
                    model: Roles,
                    as: 'role'
                }
            ],
        })
        const roleData = userRole?.get() as unknown as any
        const userData = user.get() as unknown as any;
        delete userData.password
        const userSessionData = {
            id: user.get("id"),
            name: user.get("name"),
            email: user.get("email"),
            role: roleData?.role,
        }
        const token = jwt.sign(userSessionData, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        return { data: { ...userData, role: roleData?.role }, token };
    } catch (error) {
        throw error;
    }
}


export const updateAdminService = async (adminId: string, updateData: UpdateAdminProps) => {
    try {
        const admin = await Admin.findByPk(adminId);
        if (!admin) {
            throw new Error("Admin not found");
        }
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        await admin.update(updateData);

        return admin;
    } catch (error) {
        throw error;
    }
};

export const deleteAdminService = async (adminId: string): Promise<number> => {
    try {
        const deletedCount = await Admin.destroy({ where: { id: adminId } });
        return deletedCount;
    } catch (error) {
        console.error('Error deleting admin:', error);
        throw new Error(`Failed to delete admin: ${error}`);
    }
};
