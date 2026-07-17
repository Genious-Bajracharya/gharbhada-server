import { Router } from "express";
import * as usersController from "./users.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.get("/me", authenticate, usersController.getMe);
router.patch("/me", authenticate, usersController.updateMe);

router.get("/", authenticate, requireRole("ADMIN"), usersController.listUsers);
router.patch("/:id/suspend", authenticate, requireRole("ADMIN"), usersController.suspendUser);

router.post("/kyc", authenticate, usersController.submitKyc);
router.get("/admin/kyc", authenticate, requireRole("ADMIN"), usersController.listPendingKyc);
router.patch("/:id/kyc", authenticate, requireRole("ADMIN"), usersController.reviewKyc);

export default router;
