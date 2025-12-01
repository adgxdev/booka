import jwt from "jsonwebtoken";
import prisma from "../../configs/prisma";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { setCookie } from "../../utils/cookies/setCookies";
import { CreateUserDTO, UpdateUserDTO, UserJwtPayload } from "./user.type";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";

//Signup User
export const signupUser = async (req: Request, res: Response) => {
    const body = CreateUserDTO.parse(req.body);
    const { name, email, phoneNumber, password, universityId, department, level } = body;

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) throw APIError.BadRequest("User with this email already exists");

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create first, then attempt email; delete on failure so admin isn't persisted without notification.
        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                department,
                level,
                password: hashedPassword,
                university: { connect: { id: universityId } }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                department: true,
                level: true,
                universityId: true,
                university: { select: { id: true, name: true, slug: true } },
                createdAt: true,
                updatedAt: true
            }
        });

        return APIResponse.success(res, "User created successfully", { user: createdUser }, 201);
    }
}

//Login Users
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw APIError.BadRequest("Email and password are required");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            universityId: true,
            university: { select: { id: true, name: true, slug: true } }
        }
    });

    if (!user) {
        throw APIError.NotFound("User does not exist");
    }

    //Verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
        throw APIError.BadRequest("Invalid email or password");
    }

    const isProduction = process.env.NODE_ENV === "production";

    // Clear admin and usercookies before setting new ones
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

    res.clearCookie("userAccessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    });
    res.clearCookie("userRefreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    });

    const accessToken = jwt.sign(
        {
            id: user.id
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            id: user.id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" }
    );

    setCookie(res, "userAccessToken", accessToken);
    setCookie(res, "userRefreshToken", refreshToken);

    const loggedInUserDetails = {
        id: user.id,
        name: user.name,
        email: user.email,
        universityId: user.universityId,
        university: user.university
    };

    return APIResponse.success(res, "Login successful", { user: loggedInUserDetails }, 200);
}

// Refresh user token
export const refreshUserToken = async (req: Request, res: Response) => {
    const presentedToken = req.cookies["userRefreshToken"] || req.body.refreshToken;
    if (!presentedToken) {
        throw APIError.Unauthorized("Refresh token missing");
    }

    let decoded: UserJwtPayload;
    try {
        decoded = jwt.verify(presentedToken, process.env.REFRESH_TOKEN_SECRET!) as UserJwtPayload;
    } catch (err) {
        throw APIError.Unauthorized("Invalid or expired refresh token");
    }

    if (!decoded.id) {
        throw APIError.Unauthorized("Malformed refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
        throw APIError.NotFound("User not found");
    }

    // (Optional future enhancement): rotate refresh token & invalidate old one.
    const newAccessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
    );

    // Maintain consistent cookie naming with login (userAccessToken)
    setCookie(res, "userAccessToken", newAccessToken);

    return APIResponse.success(res, "User access token refreshed", { id: user.id }, 200);
};

//Logout User
export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    const isProduction = process.env.NODE_ENV === "production";

    // Clear the cookies with consistent settings
    res.clearCookie("userAccessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    });

    res.clearCookie("userRefreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    });

    return APIResponse.success(res, "Logged out successfully");
}

export const getPersonalUserInfo = async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
        throw APIError.Unauthorized("Unauthorized");
    }

    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            universityId: true,
            university:true,
            department: true,
            level: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    if (!user) {
        throw APIError.NotFound("User not found");
    }

    return APIResponse.success(res, "User info fetched successfully", { user }, 200);
}

export const updatePersonalUserInfo = async (req: any, res: Response, next: NextFunction) => {
    const body = UpdateUserDTO.parse(req.body);
    const { name, phoneNumber, universityId, department, level } = body;
    const userId = req.user?.id;
    if (!userId) {
        throw APIError.Unauthorized("Unauthorized");
    }

    if (!name || !phoneNumber || !universityId || !department || !level) {
        throw APIError.BadRequest("All fields are required");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw APIError.NotFound("User not found");
    }

    const myUpdatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, phoneNumber, universityId, department, level },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            universityId: true,
            university:true,
            department: true,
            level: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return APIResponse.success(res, "Profile updated successfully", { user: myUpdatedUser }, 200);
}

export const changeUserPassword = async (req: any, res: Response) => {
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

    const userId = req.user?.id;
    if (!userId) {
        throw APIError.Unauthorized("Unauthorized");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
        throw APIError.NotFound("User not found");
    }

    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches) {
        throw APIError.BadRequest("Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    return APIResponse.success(res, "Password updated successfully", 200);
}