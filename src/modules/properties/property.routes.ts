import { Router } from "express";
import * as propertyController from "./property.controller";
import * as savedController from "./saved.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { requireVerifiedKyc } from "../../middlewares/kyc.middleware";

const router = Router();

router.get("/", propertyController.getProperties);
router.get("/my", authenticate, requireRole("LANDLORD"), propertyController.getMyProperties);
router.get("/saved", authenticate, savedController.getSavedProperties);
router.get("/:id", propertyController.getPropertyById);

router.post("/", authenticate, requireRole("LANDLORD"), requireVerifiedKyc, propertyController.createProperty);
router.post("/:id/save", authenticate, savedController.saveProperty);
router.patch("/:id", authenticate, requireRole("LANDLORD"), propertyController.updateProperty);
router.delete("/:id", authenticate, requireRole("LANDLORD"), propertyController.deleteProperty);
router.delete("/:id/save", authenticate, savedController.removeSaved);

router.patch("/:id/verify", authenticate, requireRole("ADMIN"), propertyController.adminVerifyProperty);

export default router;
