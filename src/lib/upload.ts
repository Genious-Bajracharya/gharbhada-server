import multer from "multer";
import { cloudinary } from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `gharbhada/${folder}`,
          resource_type: resourceType,
          transformation:
            resourceType === "image"
              ? [{ quality: "auto:good" }, { fetch_format: "auto" }]
              : undefined,
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed"));
          else resolve(result);
        }
      )
      .end(buffer);
  });
