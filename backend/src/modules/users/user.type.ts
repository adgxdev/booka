import z from "zod";

export interface SafeUser {
    id: string;
    name: string;
    email: string;
    universityId: string;
}

export interface UserJwtPayload {
    id: string;
    iat?: number;
    exp?: number;
}

export const CreateUserDTO = z.object({
    name: z.string(),
    email: z.email(),
    phoneNumber: z.string().min(10).max(11),
    password: z.string().min(6),
    universityId: z.string(),
    department: z.string(),
    level: z.number().min(100).max(600),
});

export const UpdateUserDTO = z.object({
    name: z.string(),
    phoneNumber: z.string().min(10).max(11),
    universityId: z.string(),
    department: z.string(),
    level: z.number().min(100).max(600),
});

export type CreateUserInput = z.infer<typeof CreateUserDTO>;
export type updateUserInput = z.infer<typeof UpdateUserDTO>;