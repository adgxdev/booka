import { NextFunction, Response, Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import prisma from "../configs/prisma";
import { AdminJwtPayload, SafeAdmin, AdminRole } from "../modules/admins/admin.type";
import { SafeUser } from "../modules/users/user.type";
import { SafeDeliveryAgent, AgentJwtPayload } from "../modules/agents/agent.type";

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

// Operator authenticated (operator only)
export const isOperatorAuthenticated = (
    req: Request & { admin?: SafeAdmin; role?: string },
    res: Response,
    next: NextFunction
) => verifyAdmin(req, res, next, ["operator"]);

// Either manager or super (if needed elsewhere)
export const isAnyAdminAuthenticated = (
    req: Request & { admin?: SafeAdmin; role?: string },
    res: Response,
    next: NextFunction
) => verifyAdmin(req, res, next, ["manager", "super", "operator"]);

// User authentication (access token)
export const isUserAuthenticated = async (
    req: Request & { user?: SafeUser },
    res: Response,
    next: NextFunction
) => {
    try {
        const bearer = req.headers.authorization;
        const headerToken = bearer && bearer.startsWith("Bearer ") ? bearer.slice(7) : undefined;
        const token = req.cookies["userAccessToken"] || headerToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: user token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id?: string };
        if (!decoded.id) {
            return res.status(401).json({ message: "Unauthorized: invalid token" });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, universityId: true }
        });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: user not found" });
        }

        req.user = user;
        return next();
    } catch (err: any) {
        if (err instanceof TokenExpiredError) {
            return res.status(401).json({ message: "User token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Unauthorized: invalid or malformed token" });
    }
};

// Agent authentication (access token)
export const isAgentAuthenticated = async (
    req: Request & { agent?: SafeDeliveryAgent },
    res: Response,
    next: NextFunction
) => {
    try {
        const bearer = req.headers.authorization;
        const headerToken = bearer && bearer.startsWith("Bearer ") ? bearer.slice(7) : undefined;
        const token = req.cookies["agentAccessToken"] || headerToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: agent token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as AgentJwtPayload;
        if (!decoded.id || !decoded.universityId) {
            return res.status(401).json({ message: "Unauthorized: invalid token" });
        }

        const agent = await prisma.deliveryAgent.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                universityId: true,
                assignedZones: true,
                totalCommissions: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!agent) {
            return res.status(401).json({ message: "Unauthorized: agent not found" });
        }

        // Only approved agents can access authenticated routes
        if (agent.status !== "approved") {
            return res.status(403).json({ message: "Forbidden: agent account not approved" });
        }

        req.agent = agent;
        return next();
    } catch (err: any) {
        if (err instanceof TokenExpiredError) {
            return res.status(401).json({ message: "Agent token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Unauthorized: invalid or malformed token" });
    }
};
