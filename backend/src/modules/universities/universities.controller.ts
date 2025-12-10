import jwt from "jsonwebtoken";
import prisma from "../../configs/prisma";
import { NextFunction, Request, Response } from "express";
import { slugify } from "../../utils/helper";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";
import { imagekit } from "../../utils/imagekit";
import { UploadUniversityDTO, UpdatePickupLocationsDTO } from "./universities.type";
import { logger } from "../../utils/logger";

//Upload image
export const uploadUniversityLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body
        // Extract mime type from base64 string
        const matches = fileName.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const extension = mimeType.split("/")[1];
        console.log('uploadUniversityLogo:', { mimeType, extension, fileName: fileName.slice(0, 30) });
        const response = await imagekit.upload({
            file: fileName,
            fileName: `university-logo-${Date.now()}.${extension}`,
            folder: "/universities",
        })
        res.status(201).json({
            file_url: response.url,
            file_name: response.fileId,
        })
    } catch (error) {
        console.error('uploadBookImage error:', error);
        next(error)
    }
}

//Delete Image
export const deleteUniversityLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body
        const response = await imagekit.deleteFile(fileId)

        res.status(201).json({
            success: true,
            response
        })
    } catch (error) {
        console.error('deleteUniversityLogo error:', error);
        next(error)
    }
}

export const createUniversity = async (req: Request, res: Response) => {
    const body = UploadUniversityDTO.parse(req.body);
    const { name, abbreviation, state, city, logoUrl, logoFileId } = body;

    if (!name || typeof name !== 'string') {
        throw APIError.BadRequest("University name is required");
    }

    const slug = slugify(abbreviation);

    const existingSlug = await prisma.university.findUnique({ where: { slug } });
    if (existingSlug) {
        throw APIError.BadRequest("University with this name already exists");
    }

    const newUniversity = await prisma.university.create({
        data: { name, slug, state, city, logoUrl, logoFileId },
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
            state: true,    
            city: true,
            logoUrl: true,
            logoFileId: true,
            pickupLocations: true,
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
            state: true,    
            city: true,
            logoUrl: true,
            logoFileId: true,
            pickupLocations: true,
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
    const { name, abbreviation, state, city, logoUrl, logoFileId } = req.body;

    const university = await prisma.university.findUnique({ where: { id } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    if (!name || typeof name !== 'string') {
        throw APIError.BadRequest("University name is required");
    }

    const newSlug = slugify(abbreviation);
    const slugExists = await prisma.university.findFirst({
        where: { slug: newSlug, NOT: { id } }
    });
    if (slugExists) {
        throw APIError.BadRequest("Another university with this name already exists");
    }

    const updatedUniversity = await prisma.university.update({
        where: { id },
        data: { name, slug: newSlug, state, city, logoUrl, logoFileId },
        select: {
            id: true,
            name: true,
            slug: true,
            state: true,    
            city: true,
            logoUrl: true,
            logoFileId: true,
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

    // Check if another admin is already assigned to this university
    const existingAdmin = await prisma.admin.findFirst({ 
        where: { 
            universityId,
            id: { not: adminId } // Exclude the current admin being assigned
        } 
    });
    if (existingAdmin) {
        throw APIError.BadRequest("This university already has an admin assigned. Remove the existing admin first.");
    }

    // Update the admin's universityId instead of university's adminId
    const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: { universityId }
    });

    return APIResponse.success(res, "University admin changed successfully", { admin: updatedAdmin }, 200);
}

export const removeUniversityAdmin = async (req: Request, res: Response) => {
    const { universityId } = req.body;

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    // Find admin assigned to this university and remove the assignment
    const admin = await prisma.admin.findFirst({ where: { universityId } });
    if (admin) {
        await prisma.admin.update({
            where: { id: admin.id },
            data: { universityId: null }
        });
    }

    return APIResponse.success(res, "University admin removed successfully", { success: true }, 200);
}

export const getUniversityAdmin = async (req: Request, res: Response) => {
    const { universityId } = req.params;

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) {
        throw APIError.NotFound("University not found");
    }

    // Find admin by universityId
    const admin = await prisma.admin.findFirst({
        where: { universityId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!admin) {
        throw APIError.NotFound("This university does not have an admin assigned");
    }

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

    // Check if another admin is already assigned to this university
    const existingAdmin = await prisma.admin.findFirst({ 
        where: { 
            universityId,
            id: { not: adminId }
        } 
    });
    if (existingAdmin) {
        throw APIError.BadRequest("This university already has an admin assigned. Remove the existing admin first.");
    }

    // Update admin's universityId
    const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: { universityId }
    });

    return APIResponse.success(res, "Admin assigned to university successfully", { admin: updatedAdmin }, 200);
}

export const updatePickupLocations = async (req: Request, res: Response) => {
    const body = UpdatePickupLocationsDTO.parse(req.body);
    const { pickupLocations } = body;
    const universityId = req.admin?.universityId;

    if (!universityId) {
        throw APIError.Unauthorized("Admin must be assigned to a university");
    }

    const university = await prisma.university.findUnique({ 
        where: { id: universityId } 
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    const updatedUniversity = await prisma.university.update({
        where: { id: universityId },
        data: { pickupLocations },
        select: {
            id: true,
            name: true,
            pickupLocations: true,
            updatedAt: true
        }
    });

    logger.info("Pickup locations updated", {
        entity: "university",
        entityId: universityId,
        type: "update",
        adminId: req.admin?.id,
        universityId,
        requestId: req.id
    });

    return APIResponse.success(res, "Pickup locations updated successfully", { university: updatedUniversity }, 200);
}

export const getPickupLocations = async (req: Request, res: Response) => {
    const universityId = req.admin?.universityId;

    if (!universityId) {
        throw APIError.Unauthorized("Admin must be assigned to a university");
    }

    const university = await prisma.university.findUnique({ 
        where: { id: universityId },
        select: {
            id: true,
            name: true,
            pickupLocations: true
        }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    return APIResponse.success(res, "Pickup locations retrieved successfully", { pickupLocations: university.pickupLocations }, 200);
}