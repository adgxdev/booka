import z from "zod";

export const UploadUniversityDTO = z.object({
    name: z.string(),
    abbreviation: z.string(),
    state: z.string(),
    city: z.string(),
    logoUrl: z.string().url(),
    logoFileId: z.string(),
});

export type UploadUniversityInput = z.infer<typeof UploadUniversityDTO>;
