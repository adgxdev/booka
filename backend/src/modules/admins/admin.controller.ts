import jwt from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../../utils/auth-helper";
import{ sendCustomEmail, getPatientWelcomeEmail } from '../../utils/send-email';
import bcrypt from "bcryptjs";

function generateRandomPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

// Simple retry helper for transient DB connectivity (e.g., Prisma P1001 with Supabase PgBouncer)
async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withDbRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 250): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err: any) {
            const code = err?.code;
            const msg: string = typeof err?.message === 'string' ? err.message : '';
            const isConnIssue = code === 'P1001' || msg.includes("Can't reach database server");
            const isLast = i === attempts - 1;
            if (!isConnIssue || isLast) throw err;
            const delay = baseDelayMs * (i + 1); // linear backoff
            // eslint-disable-next-line no-console
            console.warn(`[DB Retry] Attempt ${i + 1} failed (code: ${code || 'n/a'}). Retrying in ${delay}ms...`);
            await sleep(delay);
            lastErr = err;
        }
    }
    throw lastErr;
}

//Create admin
export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "admin");
        const {name, email, phoneNumber} = req.body;
        const password = generateRandomPassword();

        const existingAdmin = await withDbRetry(() =>
            prisma.admin.findUnique({
                where: {email}
            })
        );

        if(existingAdmin){
            return res.status(400).json({
                success: false,
                message: "Admin with this email already exists"
            });
        }

        if(!existingAdmin){
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = await withDbRetry(() =>
                prisma.admin.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        phoneNumber
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        role: true,
                        managerId: true,
                        createdAt: true,
                        updatedAt: true
                    }
                })
            );

            if(newAdmin){
                // Send email with credentials
                const emailContent = await getPatientWelcomeEmail({ full_name: name, email, password });
                await sendCustomEmail({ to: email, ...emailContent });
            }

            return res.status(201).json({
                success: true,
                message: "Admin created successfully", 
                admin: newAdmin
            });
        }
    } catch (error) {
        next(error);
    }
}