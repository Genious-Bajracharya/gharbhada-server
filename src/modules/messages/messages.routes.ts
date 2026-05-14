import { Router } from "express";
import * as messagesController from "./messages.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/conversations", authenticate, messagesController.getConversations);
router.get("/:userId", authenticate, messagesController.getMessages);
router.patch("/:userId/read", authenticate, messagesController.markAsRead);

export default router;
