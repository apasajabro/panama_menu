import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { AUTH_COOKIE, cookieOptions } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { loginSchema } from "../validators/auth.validator.js";

const DUMMY_HASH = "$2b$12$KIXxF3Zg1l8R4NOfYfOsNeVh0DZmCGxJpYIArlJ9GQG4H8fRjZg6S";

export const login = asyncHandler(async (req, res) => {
  const credentials = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: credentials.email } });
  const passwordMatches = await bcrypt.compare(
    credentials.password,
    user?.passwordHash || DUMMY_HASH,
  );

  if (!user || !passwordMatches || !user.isActive || user.role !== "ADMIN") {
    throw new HttpError(401, "Email atau password tidak valid.");
  }

  const token = jwt.sign(
    { role: user.role },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      subject: user.id,
      issuer: "panama-corner-api",
      audience: "panama-corner-admin",
      expiresIn: env.JWT_EXPIRES_IN,
    },
  );

  res.cookie(AUTH_COOKIE, token, cookieOptions);
  res.status(200).json({
    message: "Login berhasil.",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export const logout = (_req, res) => {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.status(200).json({ message: "Logout berhasil." });
};

export const me = (req, res) => {
  res.status(200).json({ user: req.user });
};

