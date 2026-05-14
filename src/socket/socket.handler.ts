import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthPayload } from "../types";

const onlineUsers = new Map<string, string>();

export const initSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as AuthPayload;
    onlineUsers.set(user.userId, socket.id);
    socket.join(`user:${user.userId}`);

    socket.on("message:send", async (data: { receiverId: string; content: string; propertyId?: string }) => {
      const message = await prisma.message.create({
        data: {
          senderId: user.userId,
          receiverId: data.receiverId,
          content: data.content,
          propertyId: data.propertyId,
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      });

      io.to(`user:${data.receiverId}`).emit("message:receive", message);
      socket.emit("message:sent", message);
    });

    socket.on("message:typing", (data: { receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit("message:typing", { userId: user.userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(user.userId);
    });
  });
};
