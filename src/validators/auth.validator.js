import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()).optional(),
  currentPassword: z.string().max(128).optional(),
  newPassword: z.string().min(12).max(128).optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Password saat ini wajib diisi untuk mengganti password.",
  path: ["currentPassword"],
});

