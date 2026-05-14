import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^(\+977)?9[6-9]\d{8}$/, "Invalid Nepal phone number"),
  email: z.string().email().optional(),
  password: z.string().min(8),
  role: z.enum(["TENANT", "LANDLORD"]).default("TENANT"),
});

export const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
