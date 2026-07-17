import { Router } from "express";
import * as reviewsController from "./reviews.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/properties/:propertyId/reviews", reviewsController.getPropertyReviews as any);
router.post("/properties/:propertyId/reviews", authenticate, reviewsController.createReview as any);
router.delete("/reviews/:reviewId", authenticate, reviewsController.deleteReview);

export default router;
