import { Router } from "express";
import { createCategory, deleteCategory, listAdminCategories, listPublicCategories, updateCategory } from "../controllers/category.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/", listPublicCategories);
router.get("/admin", requireAdmin, listAdminCategories);
router.post("/", requireAdmin, createCategory);
router.patch("/:id", requireAdmin, updateCategory);
router.delete("/:id", requireAdmin, deleteCategory);
export default router;

