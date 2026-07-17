import { Response } from "express";
import { AuthRequest } from "../../types";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError, paginate } from "../../utils/response";
import { createReviewSchema } from "./reviews.schema";

export const getPropertyReviews = async (req: any, res: Response) => {
  const { propertyId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const [reviews, total, avgRating] = await Promise.all([
    prisma.review.findMany({
      where: { propertyId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      ...paginate(page, limit),
    }),
    prisma.review.count({ where: { propertyId } }),
    prisma.review.aggregate({
      where: { propertyId },
      _avg: { rating: true },
    }),
  ]);

  sendSuccess(res, {
    reviews,
    total,
    page,
    pages: Math.ceil(total / limit),
    averageRating: avgRating._avg.rating || 0,
  });
};

export const createReview = async (req: AuthRequest, res: Response) => {
  const { propertyId } = req.params;
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, "Validation failed", 400, parsed.error.flatten());
    return;
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    sendError(res, "Property not found", 404);
    return;
  }

  if (property.landlordId === req.user!.userId) {
    sendError(res, "Cannot review your own property", 400);
    return;
  }

  const existingReview = await prisma.review.findUnique({
    where: { userId_propertyId: { userId: req.user!.userId, propertyId } },
  });

  if (existingReview) {
    sendError(res, "You already reviewed this property", 400);
    return;
  }

  const review = await prisma.review.create({
    data: {
      userId: req.user!.userId,
      propertyId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  sendSuccess(res, review, "Review created", 201);
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    sendError(res, "Review not found", 404);
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  const isAuthor = review.userId === req.user!.userId;
  const isAdmin = user?.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    sendError(res, "Not authorized", 403);
    return;
  }

  await prisma.review.delete({ where: { id: reviewId } });
  sendSuccess(res, null, "Review deleted");
};
