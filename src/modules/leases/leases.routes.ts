import { Router } from "express";
import * as leasesController from "./leases.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { requireVerifiedKyc } from "../../middlewares/kyc.middleware";

const router = Router();

router.post("/", authenticate, requireRole("LANDLORD"), requireVerifiedKyc, leasesController.createLease);
router.get("/my", authenticate, leasesController.getMyLeases);
router.get("/:id", authenticate, leasesController.getLeaseById);
router.patch("/:id/terminate", authenticate, requireRole("LANDLORD", "ADMIN"), leasesController.terminateLease);

export default router;
