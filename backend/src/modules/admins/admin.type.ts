import z from "zod";

export type AdminRole = 'manager' | 'super' | 'operator';

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
	role: z.enum(["super", "manager", "operator"]).default("manager")
});

export const CreateUniversitiesDTO = z.object({
	name: z.string(),
});

export type CreateAdminInput = z.infer<typeof CreateAdminDTO>;