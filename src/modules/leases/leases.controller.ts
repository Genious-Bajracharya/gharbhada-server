import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/response";
import { sendLeaseCreatedEmail } from "../../lib/email";

const createLeaseSchema = z.object({
  propertyId: z.string(),
  tenantId: z.string(),
  monthlyRent: z.number().positive(),
  deposit: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const createLease = async (req: AuthRequest, res: Response) => {
  const parsed = createLeaseSchema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400, parsed.error.flatten()); return; }

  const property = await prisma.property.findUnique({ where: { id: parsed.data.propertyId } });
  if (!property || property.landlordId !== req.user!.userId) {
    sendError(res, "Property not found or unauthorized", 404); return;
  }

  const [lease] = await prisma.$transaction([
    prisma.lease.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        status: "ACTIVE",
      },
      include: {
        property: { select: { id: true, title: true, address: true } },
        tenant: { select: { id: true, name: true, phone: true, email: true } },
      },
    }),
    prisma.property.update({
      where: { id: parsed.data.propertyId },
      data: { status: "RENTED" },
    }),
  ]);

  await sendLeaseCreatedEmail(
    lease.tenant.name,
    lease.tenant.email || "",
    lease.property.title,
    lease.startDate,
    lease.endDate,
    lease.monthlyRent
  );

  sendSuccess(res, lease, "Lease created", 201);
};

export const getMyLeases = async (req: AuthRequest, res: Response) => {
  const { userId, role } = req.user!;
  const where = role === "TENANT" ? { tenantId: userId } : { property: { landlordId: userId } };

  const leases = await prisma.lease.findMany({
    where,
    include: {
      property: { select: { id: true, title: true, address: true, images: true } },
      tenant: { select: { id: true, name: true, phone: true } },
      payments: { orderBy: { forMonth: "desc" }, take: 3 },
    },
    orderBy: { createdAt: "desc" },
  });
  sendSuccess(res, leases);
};

export const getLeaseById = async (req: AuthRequest, res: Response) => {
  const lease = await prisma.lease.findUnique({
    where: { id: req.params.id },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, phone: true, email: true } },
      payments: { orderBy: { forMonth: "asc" } },
    },
  });
  if (!lease) { sendError(res, "Lease not found", 404); return; }
  sendSuccess(res, lease);
};

export const terminateLease = async (req: AuthRequest, res: Response) => {
  const lease = await prisma.lease.findUnique({ where: { id: req.params.id }, include: { property: true } });
  if (!lease) { sendError(res, "Lease not found", 404); return; }

  await prisma.$transaction([
    prisma.lease.update({ where: { id: lease.id }, data: { status: "TERMINATED" } }),
    prisma.property.update({ where: { id: lease.propertyId }, data: { status: "ACTIVE" } }),
  ]);
  sendSuccess(res, null, "Lease terminated");
};
