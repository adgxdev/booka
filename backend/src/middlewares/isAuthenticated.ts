import { NextFunction, Response, Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import prisma from "../configs/prisma";
import { AdminJwtPayload, SafeAdmin, AdminRole } from "../modules/admins/admin.type";

// Shared core verifier
const verifyAdmin = async (
    req: Request & { admin?: SafeAdmin; role?: string },
    res: Response,
    next: NextFunction,
    allowedRoles: string[]
) => {
    try {
        const bearer = req.headers.authorization;
        const headerToken = bearer && bearer.startsWith("Bearer ") ? bearer.slice(7) : undefined;
        const token = req.cookies["adminAccessToken"] || headerToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: admin token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as AdminJwtPayload;

        if (!decoded || !decoded.role) {
            return res.status(401).json({ message: "Unauthorized: invalid token" });
        }

        if (!allowedRoles.includes(decoded.role as AdminRole)) {
            return res.status(403).json({ message: "Forbidden: insufficient role" });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true, commissions: true }
        });

        if (!admin) {
            return res.status(401).json({ message: "Unauthorized: admin not found" });
        }

        if (!allowedRoles.includes(admin.role as AdminRole)) {
            return res.status(403).json({ message: "Forbidden: role mismatch" });
        }

        req.admin = admin;
        req.role = admin.role;
        return next();
    } catch (err: any) {
        if (err instanceof TokenExpiredError) {
            return res.status(401).json({ message: "Admin token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Unauthorized: invalid or malformed token" });
    }
};

// Manager authenticated (manager only)
export const isManagerAuthenticated = (
    req: Request & { admin?: SafeAdmin; role?: string },
    res: Response,
    next: NextFunction
) => verifyAdmin(req, res, next, ["manager"]);

// Super authenticated (super only)
export const isSuperAuthenticated = (
    req: Request & { admin?: SafeAdmin; role?: string },
    res: Response,
    next: NextFunction
) => verifyAdmin(req, res, next, ["super"]);

// Either manager or super (if needed elsewhere)
export const isAnyAdminAuthenticated = (
    req: Request & { admin?: SafeAdmin; role?: string },
    res: Response,
    next: NextFunction
) => verifyAdmin(req, res, next, ["manager", "super"]);
