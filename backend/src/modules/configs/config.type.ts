import { z } from "zod";

export const UpdateConfigSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional(),
});

export type UpdateConfigInput = z.infer<typeof UpdateConfigSchema>;
