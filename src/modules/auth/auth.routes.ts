import { Router } from "express";
import * as authController from "./auth.controller";
import { authLimiter, refreshLimiter } from "@/middlewares/rateLimiter";

const router = Router();

router.post("/register", authController.register);
router.post("/login",authLimiter, authController.login);
router.post("/refresh", refreshLimiter, authController.refresh);
router.post("/logout", authController.logout);

export default router;
