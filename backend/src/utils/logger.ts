import winston, { level } from "winston";
import prisma from "../configs/prisma";
import { AuditLogType, Entity } from "../generated/prisma";

// save to AuditLog model as well 
export const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ],
});

// logger interface to save to AuditLog model and also use winston
// ...existing code...
export const logger = {
    info: (message: string, meta: Record<string, unknown> = {}) => {
        winstonLogger.info(message, meta);
        prisma.auditLog.create({
            data: {
                action: message,
                adminId: meta.adminId as string | null,
                universityId: meta.universityId as string | null,
                entity: meta.entity as Entity,
                entityId: meta.entityId as string,
                type: meta.type as AuditLogType,
                level: 'info',
                requestId: meta.requestId as string
            }
        }).catch((e) => {
            // ensure audit failures don't crash the app; record them to winston
            winstonLogger.error("Failed to save audit log (info)", { error: e });
        });
    },
    error: (message: string, meta: Record<string, unknown> = {}) => {
        meta.stack = meta.stack || new Error().stack;
        winstonLogger.error(message, meta);
        prisma.auditLog.create({
            data: {
                action: message,
                adminId: meta.adminId as string | null,
                universityId: meta.universityId as string | null,
                entity: meta.entity as Entity,
                entityId: meta.entityId as string,
                type: meta.type as AuditLogType,
                level: 'error',
                requestId: meta.requestId as string
            }
        }).catch((e) => {
            winstonLogger.error("Failed to save audit log (error)", { error: e });
        });
    },
    warn: (message: string, meta: Record<string, unknown> = {}) => {
        meta.stack = meta.stack || new Error().stack;
        winstonLogger.warn(message, meta);
        prisma.auditLog.create({
            data: {
                action: message,
                adminId: meta.adminId as string | null,
                universityId: meta.universityId as string | null,
                entity: meta.entity as Entity,
                entityId: meta.entityId as string,
                type: meta.type as AuditLogType,
                level: 'warning',
                requestId: meta.requestId as string
            }
        }).catch((e) => {
            winstonLogger.error("Failed to save audit log (warn)", { error: e });
        });
    }
};