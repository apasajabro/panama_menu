import { z } from "zod";

const menuFields = {
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  price: z.coerce.number().int().nonnegative().max(999999999),
  category: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
  isAvailable: z.boolean(),
};

export const createMenuSchema = z.object(menuFields);
export const updateMenuSchema = z.object(menuFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Minimal satu field harus diperbarui.",
);
