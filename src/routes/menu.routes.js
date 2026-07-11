import { Router } from "express";
import {
  createMenu,
  deleteMenu,
  listAdminMenus,
  listPublicMenus,
  updateMenu,
} from "../controllers/menu.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", listPublicMenus);
router.get("/admin", requireAdmin, listAdminMenus);
router.post("/", requireAdmin, createMenu);
router.patch("/:id", requireAdmin, updateMenu);
router.delete("/:id", requireAdmin, deleteMenu);

export default router;

