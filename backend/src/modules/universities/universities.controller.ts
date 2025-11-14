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

export const getUniversityById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const university = await prisma.university.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    return APIResponse.success(res, "University retrieved successfully", { university }, 200);
}

export const editUniversity = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    const university = await prisma.university.findUnique({ where: { id } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    const updatedUniversity = await prisma.university.update({
        where: { id },
        data: { name }
    });

    return APIResponse.success(res, "University updated successfully", { university: updatedUniversity }, 200);
}

export const deleteUniversity = async (req: Request, res: Response) => {
    const { id } = req.params;

    const university = await prisma.university.findUnique({ where: { id } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    await prisma.university.delete({ where: { id } });

    return APIResponse.success(res, "University deleted successfully", { university }, 200);
}

export const changeUniversityAdmin = async (req: Request, res: Response) => {
    const { universityId, adminId } = req.body;

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
        throw APIError.NotFound("Admin not found");
    }

    const updatedUniversity = await prisma.university.update({
        where: { id: universityId },
        data: { adminId }
    });

    return APIResponse.success(res, "University admin changed successfully", { university: updatedUniversity }, 200);
}