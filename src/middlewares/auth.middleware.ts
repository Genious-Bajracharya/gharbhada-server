import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload, AuthRequest } from "../types";
import { sendError } from "../utils/response";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, "No token provided", 401);
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401);
  }
};
