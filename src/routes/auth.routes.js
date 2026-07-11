import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me } from "../controllers/auth.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Terlalu banyak percobaan login. Coba kembali dalam 15 menit." },
});

router.post("/login", loginLimiter, login);
router.post("/logout", requireAdmin, logout);
router.get("/me", requireAdmin, me);

export default router;

