import { z } from "zod";

const bankAccountSchema = z.object({
  bankName: z.string().trim().min(1, "Nama bank wajib diisi."),
  accountNumber: z.string().trim().min(1, "Nomor rekening wajib diisi."),
  accountHolder: z.string().trim().min(1, "Nama pemilik rekening wajib diisi."),
});

const fields = {
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
  description: z.string().trim().max(500, "Deskripsi maksimal 500 karakter.").nullable().optional(),
  instruction: z.string().trim().nullable().optional(),
  type: z.enum(["offline", "qris", "bank"]),
  qrImage: z.string().trim().max(2000).nullable().optional(),
  accounts: z.array(bankAccountSchema).nullable().optional(),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter.").nullable().optional(),
  isRecommended: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
};

export const createPaymentMethodSchema = z.object(fields);
export const updatePaymentMethodSchema = z.object(fields).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Minimal satu field harus diperbarui."
);
