import z from "zod";

export type AdminRole = 'manager' | 'super';

export interface SafeAdmin {
	id: string;
	name: string;
	email: string;
	role: AdminRole;
	commissions: number | null;
}

export interface AdminJwtPayload {
	id: string;
	role: AdminRole;
	iat?: number;
	exp?: number;
}

export const CreateAdminDTO = z.object({
	name: z.string(),
	email: z.email(),
	phoneNumber: z.string().min(10).max(11),
	role: z.enum(["super", "manager"]).default("manager")
});

export type CreateAdminInput = z.infer<typeof CreateAdminDTO>;