import { Router } from "express";
import * as uploadController from "./upload.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { upload } from "../../lib/upload";

const router = Router();

router.post(
  "/images",
  authenticate,
  requireRole("LANDLORD", "ADMIN"),
  upload.array("images", 10),
  uploadController.uploadImages
);

router.post(
  "/video",
  authenticate,
  requireRole("LANDLORD", "ADMIN"),
  upload.single("video"),
  uploadController.uploadVideo
);

export default router;
