import jwt, { JsonWebTokenError } from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../../utils/auth-helper";
import { sendCustomEmail, getPatientWelcomeEmail } from '../../utils/send-email';
import bcrypt from "bcryptjs";
import { AuthError, ValidationError } from "../../packages/error-handler";
import { setCookie } from "../../utils/cookies/setCookies";

function generateRandomPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pwd = '';
    for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
}

// Simple retry helper for transient DB connectivity (e.g., Prisma P1001 with Supabase PgBouncer)
async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
            return res.status(400).json({
                success: false,
                message: "Admin with this email already exists"
            });
        }

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = await prisma.admin.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        phoneNumber
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        role: true,
                        managerId: true,
                        createdAt: true,
                        updatedAt: true
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

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("Email and password are required"));
        }

        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin) {
            return next(new AuthError("Admin does not exist"));
        }

        //Verify password
        const isMatch = await bcrypt.compare(password, admin.password!);
        if (!isMatch) {
            return next(new AuthError("Invalid email or password"));
        }

        const isProduction = process.env.NODE_ENV === "production";

        // Clear admin, user and seller cookies before setting new ones
        res.clearCookie("adminAccessToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        res.clearCookie("adminRefreshToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        const accessToken = jwt.sign(
            {
                id: admin.id,
                role: "admin"
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            {
                id: admin.id,
                role: "admin"
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        setCookie(res, "adminAccessToken", accessToken);
        setCookie(res, "adminRefreshToken", refreshToken);

        res.status(200).json({
            message: "Login successful",
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
        })
    } catch (error) {
        return next(error);
    }
}
