import jwt from "jsonwebtoken";
import prisma from "../../configs/prisma";
import { NextFunction, Request, Response } from "express";
import { generateRandomPassword } from "../../utils/helper";
import { sendCustomEmail, getAdminWelcomeEmail } from '../../utils/send-email';
import bcrypt from "bcryptjs";
import { setCookie } from "../../utils/cookies/setCookies";
import { AdminJwtPayload, CreateAdminDTO } from "./admin.type";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";


//Create admin
export const createAdmin = async (req: Request, res: Response) => {
    const body = CreateAdminDTO.parse(req.body);
    const { name, email, phoneNumber, role } = body;
    // Accept optional role; default to 'manager'. Only allow 'manager' or 'super'.

    const password = generateRandomPassword();

    const existingAdmin = await prisma.admin.findUnique({
        where: { email }
    });

    if (existingAdmin) throw APIError.BadRequest("Admin with this email already exists");

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create first, then attempt email; delete on failure so admin isn't persisted without notification.
        const createdAdmin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                role: role as any
            }
        });

        try {
            const emailContent = getAdminWelcomeEmail({ full_name: name, email, password });
            await sendCustomEmail({ to: email, ...emailContent });
        } catch (err) {
            // Roll back: remove the just-created admin if email fails
            try {
                await prisma.admin.delete({ where: { id: createdAdmin.id } });
            } catch (cleanupErr) {
                console.error('Failed to rollback admin after email failure:', cleanupErr);
            }
            throw APIError.Internal('Failed to send admin welcome email; admin was not created');
        }

        // Return selected projection
        const projection = await prisma.admin.findUnique({
            where: { id: createdAdmin.id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return APIResponse.success(res, "Admin created successfully", { admin: projection }, 201);
    }
}

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw APIError.BadRequest("Email and password are required");
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
        throw APIError.NotFound("Admin does not exist");
    }

    //Verify password
    const isMatch = await bcrypt.compare(password, admin.password!);
    if (!isMatch) {
        throw APIError.BadRequest("Invalid email or password");
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
            role: admin.role
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            id: admin.id,
            role: admin.role
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" }
    );

    setCookie(res, "adminAccessToken", accessToken);
    setCookie(res, "adminRefreshToken", refreshToken);

    const loggedInAdminDetails = { 
        id: admin.id, 
        name: admin.name,
        email: admin.email,
        role: admin.role
    };

    return APIResponse.success(res, "Login successful", { admin: loggedInAdminDetails }, 200);
}

export const resetAdminPassword = async (req: any, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw APIError.BadRequest("Old password and new password are required");
    }

    if (newPassword.length < 6) {
        throw APIError.BadRequest("New password must be at least 6 characters long");
    }

    if (oldPassword === newPassword) {
        throw APIError.BadRequest("New password must be different from old password");
    }

    const adminId = req.admin?.id;
    if (!adminId) {
        throw APIError.Unauthorized("Unauthorized");
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.password) {
        throw APIError.NotFound("Admin not found");
    }

    const matches = await bcrypt.compare(oldPassword, admin.password);
    if (!matches) {
        throw APIError.BadRequest("Old password is incorrect");
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({ where: { id: adminId }, data: { password: hashed } });

    return APIResponse.success(res, "Password updated successfully", 200);
}

// Refresh admin token
export const refreshAdminToken = async (req: Request, res: Response) => {
    const presentedToken = req.cookies["adminRefreshToken"] || req.body.refreshToken;
    if (!presentedToken) {
        throw APIError.Unauthorized("Refresh token missing");
    }

    let decoded: AdminJwtPayload;
    try {
        decoded = jwt.verify(presentedToken, process.env.REFRESH_TOKEN_SECRET!) as AdminJwtPayload;
    } catch (err) {
        throw APIError.Unauthorized("Invalid or expired refresh token");
    }

    if (!decoded.id || !decoded.role) {
        throw APIError.Unauthorized("Malformed refresh token");
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) {
        throw APIError.NotFound("Admin not found");
    }

    // Ensure the role in DB matches allowed roles (manager/super)
    if (admin.role !== "manager" && admin.role !== "super") {
        throw APIError.Forbidden("Invalid role");
    }

    // (Optional future enhancement): rotate refresh token & invalidate old one.
    const newAccessToken = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
    );

    // Maintain consistent cookie naming with login (adminAccessToken)
    setCookie(res, "adminAccessToken", newAccessToken);

    return APIResponse.success(res, "Admin access token refreshed", { role: admin.role }, 200);
};

export const logoutAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const isProduction = process.env.NODE_ENV === "production";

    // Clear the cookies with consistent settings
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

    return APIResponse.success(res, "Logged out successfully");
}

export const updatePersonalAdminInfo = async (req: any, res: Response, next: NextFunction) => {
    const { name, phoneNumber, email } = req.body;
    const adminId = req.admin?.id;
    if (!adminId) {
        throw APIError.Unauthorized("Unauthorized");
    }

    if (!name || !phoneNumber || !email) {
        throw APIError.BadRequest("All fields are required");
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
        throw APIError.NotFound("Admin not found");
    }

    const myUpdatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: { name, phoneNumber, email },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return APIResponse.success(res, "Profile updated successfully", { admin: myUpdatedAdmin }, 200);
}

export const getPersonalAdminInfo = async (req: any, res: Response, next: NextFunction) => {
    const adminId = req.admin?.id;
    if (!adminId) {
        throw APIError.Unauthorized("Unauthorized");
    }

    const admin = await prisma.admin.findUnique({ 
        where: { id: adminId },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    if (!admin) {
        throw APIError.NotFound("Admin not found");
    }

    return APIResponse.success(res, "Admin info fetched successfully", { admin }, 200);
}