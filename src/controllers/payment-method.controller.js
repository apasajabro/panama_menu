import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "../validators/payment-method.validator.js";

export const listPublicPaymentMethods = asyncHandler(async (_req, res) => {
  const methods = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  res.json({ data: methods });
});

export const listAdminPaymentMethods = asyncHandler(async (_req, res) => {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });
  res.json({ data: methods });
});

export const createPaymentMethod = asyncHandler(async (req, res) => {
  const input = createPaymentMethodSchema.parse(req.body);
  const method = await prisma.paymentMethod.create({
    data: input,
  });
  res.status(201).json({ message: "Metode pembayaran berhasil ditambahkan.", data: method });
});

export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const input = updatePaymentMethodSchema.parse(req.body);
  const existing = await prisma.paymentMethod.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, "Metode pembayaran tidak ditemukan.");

  const method = await prisma.paymentMethod.update({
    where: { id: existing.id },
    data: input,
  });
  res.json({ message: "Metode pembayaran berhasil diperbarui.", data: method });
});

export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const existing = await prisma.paymentMethod.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, "Metode pembayaran tidak ditemukan.");

  await prisma.paymentMethod.delete({ where: { id: existing.id } });
  res.json({ message: "Metode pembayaran berhasil dihapus." });
});
