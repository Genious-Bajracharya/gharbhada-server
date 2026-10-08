import { Response } from "express";
import { AuthRequest } from "../../types";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError, paginate } from "../../utils/response";
import { sendKycApprovedEmail, sendKycRejectedEmail } from "../../lib/email";
import { z } from "zod";

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, name: true, phone: true, email: true,
      role: true, avatar: true, isActive: true, createdAt: true,
      kyc: {
        select: {
          status: true,
          rejectedReason: true,
          citizenshipNo: true,
          citizenshipFront: true,
          citizenshipBack: true,
          selfie: true,
        },
      },
    },
  });
  if (!user) { sendError(res, "User not found", 404); return; }
  sendSuccess(res, user);
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400, parsed.error.flatten()); return; }

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: parsed.data,
    select: { id: true, name: true, phone: true, email: true, role: true },
  });
  sendSuccess(res, user, "Profile updated");
};

export const listUsers = async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const role = req.query.role as string | undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      ...paginate(page, limit),
      select: { id: true, name: true, phone: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: role ? { role: role as any } : undefined }),
  ]);

  sendSuccess(res, { users, total, page, pages: Math.ceil(total / limit) });
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const schema = z.object({ isActive: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400); return; }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: parsed.data.isActive },
    select: { id: true, isActive: true },
  });
  sendSuccess(res, user, `User ${parsed.data.isActive ? "activated" : "suspended"}`);
};

export const submitKyc = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    citizenshipNo: z.string(),
    citizenshipFront: z.string().url(),
    citizenshipBack: z.string().url(),
    selfie: z.string().url(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { 
    const existing = await prisma.kyc.findUnique({
      where: { userId: req.user!.userId },
      select: { status: true },
    });
    if (existing && (existing.status === "PENDING" || existing.status === "VERIFIED")) {
      sendError(res, `KYC is already ${existing.status.toLowerCase()}`, 400);
      return;
    }
    sendError(res, "Validation failed", 400, parsed.error.flatten()); 
    return; 
  }


  const kyc = await prisma.kyc.upsert({
    where: { userId: req.user!.userId },
    create: { userId: req.user!.userId, ...parsed.data, status: "PENDING" },
    update: { ...parsed.data, status: "PENDING" },
  });
  sendSuccess(res, kyc, "KYC submitted for review", 201);
};

export const reviewKyc = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    status: z.enum(["VERIFIED", "REJECTED"]),
    rejectedReason: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400); return; }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) { sendError(res, "User not found", 404); return; }

  const existingKyc = await prisma.kyc.findUnique({ where: { userId: req.params.id } });
  if (!existingKyc) { sendError(res, "KYC submission not found", 404); return; }

  const kyc = await prisma.kyc.update({
    where: { userId: req.params.id },
    data: {
      status: parsed.data.status,
      rejectedReason: parsed.data.rejectedReason,
      verifiedAt: parsed.data.status === "VERIFIED" ? new Date() : null,
    },
  });

  if (parsed.data.status === "VERIFIED") {
    await sendKycApprovedEmail(user.name, user.email || "");
  } else if (parsed.data.status === "REJECTED") {
    await sendKycRejectedEmail(user.name, user.email || "", parsed.data.rejectedReason || "Document verification failed");
  }

  sendSuccess(res, kyc, "KYC reviewed");
};

export const listPendingKyc = async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [kycList, total] = await Promise.all([
    prisma.kyc.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      ...paginate(page, limit),
    }),
    prisma.kyc.count({ where: { status: "PENDING" } }),
  ]);

  sendSuccess(res, { kyc: kycList, total, page, pages: Math.ceil(total / limit) });
};
