import { Router } from "express";
import {
  createPaymentMethod,
  deletePaymentMethod,
  listAdminPaymentMethods,
  listPublicPaymentMethods,
  updatePaymentMethod,
} from "../controllers/payment-method.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", listPublicPaymentMethods);
router.get("/admin", requireAdmin, listAdminPaymentMethods);
router.post("/", requireAdmin, createPaymentMethod);
router.patch("/:id", requireAdmin, updatePaymentMethod);
router.delete("/:id", requireAdmin, deletePaymentMethod);

export default router;
