import { z } from "zod";

const fields = {
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
};

export const createCategorySchema = z.object(fields);
export const updateCategorySchema = z.object(fields).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Minimal satu field harus diperbarui.",
);

