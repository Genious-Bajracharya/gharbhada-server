import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { RegisterInput, LoginInput } from "./auth.schema";
import { AuthPayload } from "../../types";

const generateTokens = (payload: AuthPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"],
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
  });
  return { accessToken, refreshToken };
};

export const register = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) throw new Error("Phone number already registered");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      passwordHash,
      role: input.role,
    },
    select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
  });

  const tokens = generateTokens({ userId: user.id, role: user.role });
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, ...tokens };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (!user || !user.isActive) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  const tokens = generateTokens({ userId: user.id, role: user.role });
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokens };
};

export const refresh = async (token: string) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) throw new Error("Invalid refresh token");

  let payload: AuthPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as AuthPayload;
  } catch {
    throw new Error("Invalid refresh token");
  }

  await prisma.refreshToken.delete({ where: { token } });

  const newTokens = generateTokens({ userId: payload.userId, role: payload.role });
  await prisma.refreshToken.create({
    data: {
      token: newTokens.refreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return newTokens;
};

export const logout = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};
