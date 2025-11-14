import jwt from "jsonwebtoken";
import prisma from "../../configs/prisma";
import { NextFunction, Request, Response } from "express";
import { generateRandomPassword } from "../../utils/helper";
import { sendCustomEmail, getAdminWelcomeEmail } from '../../utils/send-email';
import bcrypt from "bcryptjs";
import { setCookie } from "../../utils/cookies/setCookies";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";

export const createUniversity = async (req: Request, res: Response) => {
    const { name } = req.body;

    const existingUniversity = await prisma.university.findUnique({
        where: { name }
    });

    if (existingUniversity) throw APIError.BadRequest("University with this name already exists");

    if (!existingUniversity) {
        const newUniversity = await prisma.university.create({
            data: {
                name
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return APIResponse.success(res, "University created successfully", { university: newUniversity }, 201);
    }
}

export const getUniversities = async (req: Request, res: Response) => {
    const universities = await prisma.university.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return APIResponse.success(res, "Universities retrieved successfully", { universities }, 200);
}