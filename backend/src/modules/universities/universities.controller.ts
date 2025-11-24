import jwt from "jsonwebtoken";
import prisma from "../../configs/prisma";
import { Request, Response } from "express";
import { slugify } from "../../utils/helper";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";

export const createUniversity = async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
        throw APIError.BadRequest("University name is required");
    }

    const slug = slugify(name);

    const existingSlug = await prisma.university.findUnique({ where: { slug } });
    if (existingSlug) {
        throw APIError.BadRequest("University with this name already exists");
    }

    const newUniversity = await prisma.university.create({
        data: { name, slug },
        select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return APIResponse.success(res, "University created successfully", { university: newUniversity }, 201);
}

export const getUniversities = async (req: Request, res: Response) => {
    const universities = await prisma.university.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
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
            slug: true,
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

    if (!name || typeof name !== 'string') {
        throw APIError.BadRequest("University name is required");
    }

    const newSlug = slugify(name);
    const slugExists = await prisma.university.findFirst({
        where: { slug: newSlug, NOT: { id } }
    });
    if (slugExists) {
        throw APIError.BadRequest("Another university with this name already exists");
    }

    const updatedUniversity = await prisma.university.update({
        where: { id },
        data: { name, slug: newSlug },
        select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true
        }
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

export const removeUniversityAdmin = async (req: Request, res: Response) => {
    const { universityId } = req.body;

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    const updatedUniversity = await prisma.university.update({
        where: { id: universityId },
        data: { adminId: null }
    });

    return APIResponse.success(res, "University admin removed successfully", { university: updatedUniversity }, 200);
}

export const getUniversityAdmin = async (req: Request, res: Response) => {
    const { universityId } = req.params;

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    if (!university.adminId) {
        throw APIError.NotFound("This university does not have an admin assigned");
    }

    const admin = await prisma.admin.findUnique({
        where: { id: university.adminId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return APIResponse.success(res, "University admin retrieved successfully", { admin }, 200);
}

export const assignAdminToUniversity = async (req: Request, res: Response) => {
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

    return APIResponse.success(res, "Admin assigned to university successfully", { university: updatedUniversity }, 200);
}