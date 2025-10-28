import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
    const headerId = (req.headers["x-request-id"] as string) || undefined;
    const id = headerId || req.id || randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
};