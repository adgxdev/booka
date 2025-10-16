import jwt from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../../utils/auth-helper";
import { sendCustomEmail, getPatientWelcomeEmail } from '../../utils/send-email';

function generateRandomPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pwd = '';
    for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
}

//Create admin
export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "admin");
        const { name, email, phoneNumber } = req.body;
        const password = generateRandomPassword();

        const existingAdmin = await prisma.admin.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this email already exists" });
        }

        if (!existingAdmin) {
            const newAdmin = await prisma.admin.create({
                data: {
                    name,
                    email,
                    password,
                    phoneNumber
                }
            });

            if (newAdmin) {
                // Send email with credentials
                const emailContent = await getPatientWelcomeEmail({ full_name: name, email, password });
                await sendCustomEmail({ to: email, ...emailContent });
            }

            return res.status(201).json({
                success: true,
                message: "Admin created successfully",
                admin: newAdmin
            });
        }
    } catch (error) {
        next(error);
    }
}