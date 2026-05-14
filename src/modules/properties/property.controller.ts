import { Request, Response } from "express";
import { AuthRequest, PropertyFilterQuery } from "../../types";
import { createPropertySchema, updatePropertySchema } from "./property.schema";
import * as propertyService from "./property.service";
import { sendSuccess, sendError } from "../../utils/response";
import { z } from "zod";

export const createProperty = async (req: AuthRequest, res: Response) => {
  const parsed = createPropertySchema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400, parsed.error.flatten()); return; }

  try {
    const property = await propertyService.createProperty(req.user!.userId, parsed.data);
    sendSuccess(res, property, "Property listed successfully", 201);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : "Failed to create property", 400);
  }
};

export const getProperties = async (req: Request, res: Response) => {
  const result = await propertyService.getProperties(req.query as PropertyFilterQuery);
  sendSuccess(res, result);
};

export const getPropertyById = async (req: Request, res: Response) => {
  const property = await propertyService.getPropertyById(req.params.id);
  if (!property) { sendError(res, "Property not found", 404); return; }
  sendSuccess(res, property);
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  const parsed = updatePropertySchema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400, parsed.error.flatten()); return; }

  try {
    const property = await propertyService.updateProperty(req.params.id, req.user!.userId, parsed.data);
    sendSuccess(res, property, "Property updated");
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : "Failed to update", 400);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    await propertyService.deleteProperty(req.params.id, req.user!.userId);
    sendSuccess(res, null, "Property removed");
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : "Failed to delete", 400);
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
  const properties = await propertyService.getLandlordProperties(req.user!.userId);
  sendSuccess(res, properties);
};

export const adminVerifyProperty = async (req: AuthRequest, res: Response) => {
  const schema = z.object({ isVerified: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { sendError(res, "Validation failed", 400); return; }

  const property = await propertyService.adminVerifyProperty(req.params.id, parsed.data.isVerified);
  sendSuccess(res, property, "Property verification updated");
};
