import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "../types";
import { sendError } from "../utils/response";

export const requireRole = (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, "Forbidden: insufficient permissions", 403);
      return;
    }
    next();
  };
