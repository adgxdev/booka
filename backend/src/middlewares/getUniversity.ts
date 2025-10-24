import { NextFunction, Request } from "express";
import { APIError } from "../utils/APIError";
import prisma from "../configs/prisma";

export const isAnyUniversityAuthenticated = (
    req: Request,
    // res: Response,
    next: NextFunction
) => async () => {
    const universityId = req.headers["x-university-id"] || req.cookies["universityId"];

    if (!universityId || typeof universityId !== "string") {
        throw APIError.Unauthorized("University ID missing");
    };
    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true }
    });
    if (!university) {
        throw APIError.Unauthorized("University not found");
    }
    req.university = { id: university.id, name: university.name };
    next();
};