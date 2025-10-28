// ...existing code...
import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import { APIResponse } from "../utils/APIResponse";
import { winstonLogger } from "../utils/logger";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const error = APIError.from(err);

    const meta = {
        requestId: req.id ?? null,
        adminId: (req as any).admin?.id ?? null,
        universityId: (req as any).university?.id ?? null,
        stack: error.stack ?? null,
    };

    winstonLogger.error(`[${req.method}] ${req.originalUrl} -> ${error.message}`, meta);

    return APIResponse.error(res, error.message, error.statusCode, error.details);
};