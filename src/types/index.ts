import { Role } from "@prisma/client";
import { Request } from "express";

export interface AuthPayload {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PropertyFilterQuery extends PaginationQuery {
  type?: string;
  purpose?: string;
  city?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  lat?: string;
  lng?: string;
  radius?: string;
}
