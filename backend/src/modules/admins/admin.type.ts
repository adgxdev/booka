export type AdminRole = 'manager' | 'super';

export interface SafeAdmin {
	id: string;
	name: string;
	email: string;
	role: AdminRole;
	managerId: string | null;
}

export interface AdminJwtPayload {
	id: string;
	role: AdminRole;
	iat?: number;
	exp?: number;
}
