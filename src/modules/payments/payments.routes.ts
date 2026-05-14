import { Router } from "express";
import * as paymentsController from "./payments.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.post("/initiate", authenticate, requireRole("TENANT"), paymentsController.initiatePayment);
router.post("/verify/khalti", paymentsController.verifyKhalti);
router.get("/lease/:leaseId", authenticate, paymentsController.getLeasePayments);

export default router;
