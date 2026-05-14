import { Response } from "express";
import { AuthRequest } from "../../types";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError, paginate } from "../../utils/response";

export const saveProperty = async (req: AuthRequest, res: Response) => {
  const { propertyId } = req.params;
  try {
    await prisma.savedProperty.upsert({
      where: { userId_propertyId: { userId: req.user!.userId, propertyId } },
      create: { userId: req.user!.userId, propertyId },
      update: {},
    });
    sendSuccess(res, null, "Property saved");
  } catch {
    sendError(res, "Failed to save property", 400);
  }
};

export const removeSaved = async (req: AuthRequest, res: Response) => {
  const { propertyId } = req.params;
  try {
    await prisma.savedProperty.delete({
      where: { userId_propertyId: { userId: req.user!.userId, propertyId } },
    });
    sendSuccess(res, null, "Property removed from saved");
  } catch {
    sendError(res, "Property not in saved list", 404);
  }
};

export const getSavedProperties = async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const [saved, total] = await Promise.all([
    prisma.savedProperty.findMany({
      where: { userId: req.user!.userId },
      ...paginate(page, limit),
      include: {
        property: { include: { landlord: { select: { id: true, name: true, phone: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedProperty.count({ where: { userId: req.user!.userId } }),
  ]);

  sendSuccess(res, {
    properties: saved.map((s) => s.property),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};
