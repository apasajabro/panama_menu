import { Router } from "express";
import { readSettings, updateSettings } from "../controllers/setting.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/", readSettings);
router.patch("/", requireAdmin, updateSettings);
export default router;

