import z from "zod";
import { Waitlist } from "../../generated/prisma/client";


export type SafeWaitlist = {
    id: string;
    email: string;
    referralCode: string;
    parentCode: string | null;
    createdAt: Date;

    referredBy?: SafeWaitlist | null; // optional, when included
    referrals?: SafeWaitlist[];       // optional, when included
};

type WaitlistWithRelations = Waitlist & {
    referredBy?: Waitlist | null;
    referrals?: Waitlist[];
};

export const sanitizeWaitlist = (waitlist: WaitlistWithRelations): SafeWaitlist => {
    const base: SafeWaitlist = {
        id: waitlist.id,
        email: waitlist.email,
        referralCode: waitlist.referralCode,
        parentCode: waitlist.parentCode,
        createdAt: waitlist.createdAt,
    };

    // If relations are loaded, sanitize them too
    if (waitlist.referredBy) {
        base.referredBy = {
            id: waitlist.referredBy.id,
            email: waitlist.referredBy.email,
            referralCode: waitlist.referredBy.referralCode,
            parentCode: waitlist.referredBy.parentCode,
            createdAt: waitlist.referredBy.createdAt,
        };
    } else {
        base.referredBy = undefined;
    }

    if (waitlist.referrals) {
        base.referrals = waitlist.referrals.map((r: Waitlist) => ({
            id: r.id,
            email: r.email,
            referralCode: r.referralCode,
            parentCode: r.parentCode,
            createdAt: r.createdAt,
        }));
    } else {
        base.referrals = undefined;
    }

    return base;
};


export const CreateWaitlistDto = z.object({
    email: z.string().email(),
    refCode: z.string().optional(),
});

export type CreateWaitlistInput = z.infer<typeof CreateWaitlistDto>;