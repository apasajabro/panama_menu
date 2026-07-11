import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const uploadDirectory = path.join(rootDirectory, "uploads", "menu");
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadMenuImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "Pilih file gambar terlebih dahulu.");
  const detected = await fileTypeFromBuffer(req.file.buffer);
  if (!detected || !allowedTypes.has(detected.mime)) {
    throw new HttpError(415, "File harus berupa JPEG, PNG, atau WebP yang valid.");
  }

  let output;
  try {
    output = await sharp(req.file.buffer, { failOn: "error", limitInputPixels: 25_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new HttpError(422, "Gambar rusak atau tidak dapat diproses.");
  }

  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.webp`;
  await writeFile(path.join(uploadDirectory, filename), output, { flag: "wx" });
  res.status(201).json({ message: "Gambar berhasil diunggah.", data: { imageUrl: `/uploads/menu/${filename}` } });
});

