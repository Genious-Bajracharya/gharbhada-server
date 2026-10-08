import { Response } from "express";
import { AuthRequest } from "../../types";
import { uploadToCloudinary } from "../../lib/upload";
import { sendSuccess, sendError } from "../../utils/response";

export const uploadImages = async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) { sendError(res, "No files uploaded", 400); return; }

  try {
    const uploads = await Promise.all(
      files.map((f) => uploadToCloudinary(f.buffer, "properties"))
    );
    const urls = uploads.map((r) => r.secure_url);
    sendSuccess(res, { urls }, "Images uploaded successfully");
  } catch (err) {
    sendError(res, "Image upload failed", 500);
  }
};

export const uploadVideo = async (req: AuthRequest, res: Response) => {
  const file = req.file;
  if (!file) { sendError(res, "No file uploaded", 400); return; }

  try {
    const result = await uploadToCloudinary(file.buffer, "properties/videos", "video");
    sendSuccess(res, { url: result.secure_url, duration: result.duration }, "Video uploaded");
  } catch (err) {
    sendError(res, "Video upload failed", 500);
  }
};

export const uploadKycImage = async (req: AuthRequest, res: Response) => {
  const file = req.file;
  if (!file || !file.mimetype.startsWith("image/")) {
    sendError(res, "An image file is required", 400);
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    sendError(res, "Image must be under 10MB", 400);
    return;
  }

  try {
    const result = await uploadToCloudinary(file.buffer, "kyc");
    sendSuccess(res, { url: result.secure_url }, "Image uploaded");
  } catch {
    sendError(res, "Image upload failed", 500);
  }
};