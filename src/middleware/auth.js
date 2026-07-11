import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

export const AUTH_COOKIE = "panama_admin_token";

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 2 * 60 * 60 * 1000,
};

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[AUTH_COOKIE];

  if (!token) {
    throw new HttpError(401, "Sesi tidak valid. Silakan login kembali.");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "panama-corner-api",
      audience: "panama-corner-admin",
    });
  } catch {
    throw new HttpError(401, "Sesi tidak valid. Silakan login kembali.");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive || user.role !== "ADMIN") {
    throw new HttpError(403, "Akses admin ditolak.");
  }

  req.user = user;
  next();
});

