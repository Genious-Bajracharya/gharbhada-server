import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendError } from "../utils/response";
import { prisma } from "../lib/prisma";

export const requireVerifiedKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const kyc = await prisma.kyc.findUnique({
      where: { userId: req.user!.userId },
      select: { status: true }
    });

    if (!kyc || kyc.status !== "VERIFIED") {
      sendError(res, "KYC verification required. Please complete your KYC first.", 403);
      return;
    }

    next();
  } catch (err) {
    sendError(res, "Failed to verify KYC status", 500);
  }
};
