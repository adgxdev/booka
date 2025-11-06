import { Request, Response } from "express";
import { CreateWaitlistDto, sanitizeWaitlist } from "./waitlist.type";
import { generateRandomPassword } from "../../utils/helper";
import prisma from "../../configs/prisma";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";
import { logger } from "../../utils/logger";
import { sendCustomEmail, waitlistEmail } from "../../utils/send-email";

export const createWaitlist = async (req: Request, res: Response) => {
    const body = CreateWaitlistDto.parse(req.body);
    const { email, refCode } = body;

    // 1️⃣ Check if email already exists
    const existing = await prisma.waitlist.findUnique({
        where: { email },
    });

    if (existing) {
        logger.warn(`Attempt to register already existing email in waitlist`, {
            entity: "waitlist",
            entityId: existing.id,
            type: "create",
            requestId: req.id
        });
        throw APIError.Conflict("Email is already registered in the waitlist.");
    };

    // 2️⃣ Generate unique referral code
    let referralCode: string;
    while (true) {
        const tempCode = generateRandomPassword(4).toUpperCase();
        const existingCode = await prisma.waitlist.findUnique({
            where: { referralCode: tempCode },
        });
        if (!existingCode) {
            referralCode = tempCode;
            break;
        }
    }

    // 3️⃣ Optional: find parent (referrer)
    let parentCode: string | null = null;
    if (refCode) {
        const referrer = await prisma.waitlist.findUnique({
            where: { referralCode: refCode },
        });
        if (referrer) {
            parentCode = referrer.referralCode;
        }
    }

    // 4️⃣ Create new waitlist record
    const waitlistEntry = await prisma.waitlist.create({
        data: {
            email,
            referralCode,
            parentCode,
        },
    });

    logger.info(`New waitlist entry created`, {
        entity: "waitlist",
        entityId: waitlistEntry.id,
        type: "create",
        requestId: req.id
    });
    // const emailContent = waitlistEmail({ email: waitlistEntry.email, id: waitlistEntry.id });
    // await sendCustomEmail({ to: email, ...emailContent });
    // 5️⃣ Response
    return APIResponse.success(res, "Waitlist entry created successfully.", {
        waitlistEntry: sanitizeWaitlist(waitlistEntry)
    }, 201);
};

export const getSingleWaitlist = async (req: Request, res: Response) => {
    const waitlistId = req.params.id;
    const waitlistEntry = await prisma.waitlist.findUnique({
        where: { id: waitlistId },
        include: { referrals: true, referredBy: true },
    });
    if (!waitlistEntry) {
        logger.warn(`Waitlist entry not found`, {
            entity: "waitlist",
            type: "read",
            requestId: req.id,
        });
        return APIResponse.success(res, "Waitlist entry not found.", { waitlist: [] }, 200);
    }

    logger.info(`Waitlist entry retrieved`, {
        entity: "waitlist",
        entityId: waitlistEntry.id,
        type: "read",
        requestId: req.id,
    });
    return APIResponse.success(res, "Waitlist entry retrieved successfully.", {
        waitlist: sanitizeWaitlist(waitlistEntry),
    });
}