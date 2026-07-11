import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import multer from "multer";
import { env } from "../config/env.js";

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.` });
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Ukuran gambar maksimal 5 MB."
      : "Upload ditolak. Gunakan satu file JPEG, PNG, atau WebP.";
    return res.status(400).json({ message });
  }
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Data yang dikirim tidak valid.",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Data dengan nilai tersebut sudah tersedia." });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status === 500 ? "Terjadi kesalahan pada server." : error.message;

  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json({
    message,
    ...(error.details ? { errors: error.details } : {}),
    ...(env.NODE_ENV === "development" && status === 500 ? { detail: error.message } : {}),
  });
};
