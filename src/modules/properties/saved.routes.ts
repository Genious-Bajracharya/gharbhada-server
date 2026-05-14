import { Router } from "express";
import * as savedController from "./saved.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/:propertyId", authenticate, savedController.saveProperty);
router.delete("/:propertyId", authenticate, savedController.removeSaved);
router.get("/", authenticate, savedController.getSavedProperties);

export default router;
