import jwt from "jsonwebtoken";
import prisma from "../../types/prisma";
import { NextFunction, Request, Response } from "express";
import { generateRandomPassword } from "../../utils/helper";
import { sendCustomEmail, getAdminWelcomeEmail } from '../../utils/send-email';
import bcrypt from "bcryptjs";
import { setCookie } from "../../utils/cookies/setCookies";
import { AdminJwtPayload, CreateAdminDTO } from "./admin.type";
import { APIError } from "../../utils/error-handler";
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
        const newAdmin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                role: role as any
            },
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

        if (newAdmin) {
            // Send email with credentials
            const emailContent = getAdminWelcomeEmail({ full_name: name, email, password });
            await sendCustomEmail({ to: email, ...emailContent });
        }

        return APIResponse.success(res, "Admin created successfully", { admin: newAdmin }, 201);
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

    res.status(200).json({
        message: "Login successful",
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    })
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

    return res.status(200).json({ success: true, message: "Password updated successfully" });
}

// Refresh admin token
export const refreshAdminToken = async (req: Request, res: Response) => {
    const presentedToken = req.cookies["adminRefreshToken"] || req.body.refreshToken;
    if (!presentedToken) {
        return res.status(401).json({ message: "Refresh token missing" });
    }

    let decoded: AdminJwtPayload;
    try {
        decoded = jwt.verify(presentedToken, process.env.REFRESH_TOKEN_SECRET!) as AdminJwtPayload;
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    if (!decoded.id || !decoded.role) {
        return res.status(401).json({ message: "Malformed refresh token" });
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
    }

    // Ensure the role in DB matches allowed roles (manager/super)
    if (admin.role !== "manager" && admin.role !== "super") {
        return res.status(403).json({ message: "Forbidden: invalid role" });
    }

    // (Optional future enhancement): rotate refresh token & invalidate old one.
    const newAccessToken = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
    );

    // Maintain consistent cookie naming with login (adminAccessToken)
    setCookie(res, "adminAccessToken", newAccessToken);

    return res.status(200).json({ message: "Admin access token refreshed", role: admin.role });
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

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
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
        data: { name, phoneNumber, email }
    })


    return res.status(200).json({ success: true, data: myUpdatedAdmin });
}

export const getPersonalAdminInfo = async (req: any, res: Response, next: NextFunction) => {
    const adminId = req.admin?.id;
    if (!adminId) {
        throw APIError.Unauthorized("Unauthorized");
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
        throw APIError.NotFound("Admin not found");
    }

    return res.status(200).json({ success: true, data: admin });
}