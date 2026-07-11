import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const originGuard = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  if (!origin) return next();

  // Bersihkan tanda kutip jika ada di variabel env
  const configuredOrigin = env.CLIENT_ORIGIN.replace(/^["']|["']$/g, "");

  // Deteksi same-origin secara dinamis (mendukung proxy HTTPS seperti Render)
  const host = req.get("host");
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const selfOrigin = `${protocol}://${host}`;

  if (origin === configuredOrigin || origin === selfOrigin) {
    return next();
  }

  return next(new HttpError(403, "Akses ditolak: Permintaan tidak diizinkan dari domain asal ini demi keamanan data Anda."));
};

