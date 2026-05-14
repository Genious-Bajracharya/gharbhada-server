import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  type: z.enum(["FLAT", "HOUSE", "ROOM", "LAND", "COMMERCIAL"]),
  purpose: z.enum(["RENT", "SALE", "BOTH"]),
  price: z.number().positive(),
  negotiable: z.boolean().default(false),
  deposit: z.number().positive().optional(),
  address: z.string().min(5),
  city: z.string(),
  district: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  area: z.number().positive().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional(),
  features: z.object({
    attachedBathroom: z.boolean().default(false),
    parking: z.boolean().default(false),
    furnished: z.boolean().default(false),
    waterSupply: z.boolean().default(false),
    electricity: z.boolean().default(false),
    internet: z.boolean().default(false),
    security: z.boolean().default(false),
    lift: z.boolean().default(false),
    garden: z.boolean().default(false),
    rooftopAccess: z.boolean().default(false),
  }),
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
