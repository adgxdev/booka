import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";


// Admin-specific authentication middleware
const isAdminAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["adminAccessToken"] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Admin token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "admin";
        }

        if (!decoded || decoded.role !== "admin") {
            return res.status(401).json({
                message: "Unauthorised! Invalid admin token"
            })
        }

        const admin = await prisma.admin.findUnique({ where: { id: decoded.id } })
        if (!admin || admin.role !== "manager") {
            return res.status(401).json({ message: "Unauthorized! Admin not found or invalid role" });
        }
        console.log(admin)
        req.admin = admin;
        req.role = decoded.role;

        return next();

    } catch (error: any) {
        console.log("Error in isAdminAuthenticated: ", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Admin token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        return res.status(401).json({
            message: "Unauthorized! Invalid admin token"
        })
    }
}

export { isAdminAuthenticated };