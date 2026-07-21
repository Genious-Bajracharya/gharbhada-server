import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload, AuthRequest } from "../types";
import { sendError } from "../utils/response";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  if(!token){
    sendError(res,"No token Provided",401)
    return
  }
  
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    req.user = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401);
  }
};
