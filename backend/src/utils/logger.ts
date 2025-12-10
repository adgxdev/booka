import winston from "winston";
import prisma from "../configs/prisma";
import { AuditLogType, AuduitLogLevel, Entity } from "../generated/prisma";
//import { Entity } from "../generated/prisma/enums";
// import { AuditLogType, AuduitLogLevel, Entity } from "";
// import { AuditLogType, AuduitLogLevel, Entity } from "";

type Meta = {
    adminId?: string | null;
    universityId?: string | null;
    entity?: Entity;
    entityId?: string;
    type?: AuditLogType;
    requestId?: string;
    stack?: string;
    level?: AuduitLogLevel;
};

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

export const logger = {
    info: (message: string, meta: Meta) => {
        winstonLogger.info(message, meta);
        prisma.auditLog.create({
            data: {
                action: message,
                adminId: meta.adminId ?? null,
                universityId: meta.universityId ?? null,
                entity: (meta.entity as Entity) ?? "system",
                entityId: meta.entityId ?? null,
                type: meta.type ?? "create",
                level: "info",
                requestId: meta.requestId ?? null
            }
        }).catch((e) => {
            winstonLogger.error("Failed to save audit log (info)", { error: e.message, stack: e.stack });
        });
    },

    warn: (message: string, meta: Meta) => {
        meta.stack = meta.stack || new Error().stack;
        winstonLogger.warn(message, meta);
        prisma.auditLog.create({
            data: {
                action: message,
                adminId: meta.adminId ?? null,
                universityId: meta.universityId ?? null,
                entity: (meta.entity as Entity) ?? "system",
                entityId: meta.entityId ?? null,
                type: meta.type ?? "update",
                level: "warning",
                requestId: meta.requestId ?? null
            }
        }).catch((e) => {
            winstonLogger.error("Failed to save audit log (warn)", { error: e.message, stack: e.stack });
        });
    },

    error: (message: string, meta: Meta) => {
        meta.stack = meta.stack || new Error().stack;
        winstonLogger.error(message, meta);
        prisma.auditLog.create({
            data: {
                action: message,
                adminId: meta.adminId ?? null,
                universityId: meta.universityId ?? null,
                entity: (meta.entity as Entity) ?? "system",
                entityId: meta.entityId ?? null,
                type: meta.type ?? "create",
                level: "error",
                requestId: meta.requestId ?? null
            }
        }).catch((e) => {
            winstonLogger.error("Failed to save audit log (error)", { error: e.message, stack: e.stack });
        });
    }
};