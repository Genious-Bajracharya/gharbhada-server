import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/response";

const initiateSchema = z.object({
  leaseId: z.string(),
  forMonth: z.string().datetime(),
  gateway: z.enum(["KHALTI", "ESEWA"]),
});

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400, parsed.error.flatten()); return; }

  const lease = await prisma.lease.findUnique({ where: { id: parsed.data.leaseId } });
  if (!lease || lease.tenantId !== req.user!.userId) {
    sendError(res, "Lease not found or unauthorized", 404); return;
  }

  const forMonth = new Date(parsed.data.forMonth);
  const existing = await prisma.payment.findFirst({
    where: { leaseId: lease.id, forMonth, status: "PAID" },
  });
  if (existing) { sendError(res, "Payment already made for this month", 400); return; }

  const payment = await prisma.payment.create({
    data: {
      leaseId: lease.id,
      amount: lease.monthlyRent,
      forMonth,
      gateway: parsed.data.gateway,
      status: "PENDING",
      dueDate: new Date(forMonth.getFullYear(), forMonth.getMonth() + 1, 5),
    },
  });

  const khaltiPayload = {
    return_url: `${process.env.CLIENT_URL}/payment/success`,
    website_url: process.env.CLIENT_URL,
    amount: lease.monthlyRent * 100,
    purchase_order_id: payment.id,
    purchase_order_name: `Rent for ${forMonth.toLocaleString("default", { month: "long", year: "numeric" })}`,
  };

  sendSuccess(res, { payment, khaltiPayload }, "Payment initiated");
};

export const verifyKhalti = async (req: Request, res: Response) => {
  const { pidx, paymentId } = req.body;
  if (!pidx || !paymentId) { sendError(res, "Missing pidx or paymentId", 400); return; }

  try {
    const khaltiRes = await fetch(`${process.env.KHALTI_BASE_URL}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });
    const data = await khaltiRes.json() as any;

    if (data.status === "Completed") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "PAID", txnId: pidx, paidAt: new Date() },
      });
      sendSuccess(res, null, "Payment verified successfully");
    } else {
      sendError(res, "Payment not completed", 400);
    }
  } catch {
    sendError(res, "Failed to verify payment", 500);
  }
};

export const getLeasePayments = async (req: AuthRequest, res: Response) => {
  const payments = await prisma.payment.findMany({
    where: { leaseId: req.params.leaseId },
    orderBy: { forMonth: "desc" },
  });
  sendSuccess(res, payments);
};
