import z from "zod";

export const UploadUniversityDTO = z.object({
    name: z.string(),
    abbreviation: z.string(),
    state: z.string(),
    city: z.string(),
    logoUrl: z.string().url(),
    logoFileId: z.string(),
});

export const UpdatePickupLocationsDTO = z.object({
    pickupLocations: z.array(z.string().min(1, "Location cannot be empty")).min(1, "At least one pickup location is required"),
});

export type UploadUniversityInput = z.infer<typeof UploadUniversityDTO>;
export type UpdatePickupLocationsInput = z.infer<typeof UpdatePickupLocationsDTO>;
