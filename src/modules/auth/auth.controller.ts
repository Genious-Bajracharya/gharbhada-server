import { Request, Response } from "express";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schema";
import * as authService from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};


export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, "Validation failed", 400, parsed.error.flatten());
    return;
  }
  try {
    const result = await authService.register(parsed.data);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    sendSuccess(res, result, "Registered successfully", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    sendError(res, message, 400);
  }
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, "Validation failed", 400, parsed.error.flatten());
    return;
  }
  try {
    const result = await authService.login(parsed.data);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });

    sendSuccess(res, result.user, "Logged in successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    sendError(res, message, 401);
  }
};

export const refresh = async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse({ refreshToken: req.cookies.refreshToken });
  if (!parsed.success) {
    sendError(res, "No refresh token provided", 401);
    return;
  }
  try {
    const tokens = await authService.refresh(parsed.data.refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    sendSuccess(res, null, "Token refreshed");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);
    sendError(res, message, 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) await authService.logout(refreshToken);
  res.clearCookie("refreshToken",cookieOptions);
  res.clearCookie("accessToken",cookieOptions);
  sendSuccess(res, null, "Logged out successfully");
};
