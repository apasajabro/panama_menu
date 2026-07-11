import { z } from "zod";

export const updateSettingSchema = z.object({
  ordersEnabled: z.boolean().optional(),
  heroTitle: z.string().trim().min(10).max(180).optional(),
  heroDescription: z.string().trim().min(10).max(500).optional(),
}).refine((value) => Object.keys(value).length > 0, "Minimal satu pengaturan harus diubah.");
