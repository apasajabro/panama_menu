import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const originGuard = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  if (origin && origin !== env.CLIENT_ORIGIN) {
    return next(new HttpError(403, "Origin permintaan tidak diizinkan."));
  }

  return next();
};

