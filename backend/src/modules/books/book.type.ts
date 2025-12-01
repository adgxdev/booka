import z from "zod";

export const UploadBookDTO = z.object({
    title: z.string(),
    author: z.string(),
    edition: z.string().optional(),
    price: z.number().min(0),
    quantity: z.number().min(0),
    lowAlert: z.number().min(0),
    imageUrl: z.string().url(),
    imageFileId: z.string(),
});

export type UploadBookInput = z.infer<typeof UploadBookDTO>;
