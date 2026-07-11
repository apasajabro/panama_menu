import { Router } from "express";
import multer from "multer";
import { uploadMenuImage } from "../controllers/upload.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
  fileFilter: (_req, file, callback) => {
    const accepted = new Set(["image/jpeg", "image/png", "image/webp"]);
    callback(accepted.has(file.mimetype) ? null : new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"), accepted.has(file.mimetype));
  },
});

router.post("/images", requireAdmin, upload.single("image"), uploadMenuImage);
export default router;

