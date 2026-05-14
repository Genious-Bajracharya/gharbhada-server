import { Response } from "express";
import { AuthRequest } from "../../types";
import { prisma } from "../../lib/prisma";
import { sendSuccess } from "../../utils/response";

export const getConversations = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      property: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    distinct: ["senderId", "receiverId"],
  });

  sendSuccess(res, messages);
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const otherId = req.params.userId;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  sendSuccess(res, messages);
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  await prisma.message.updateMany({
    where: { senderId: req.params.userId, receiverId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  sendSuccess(res, null, "Messages marked as read");
};
