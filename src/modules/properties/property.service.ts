import { prisma } from "../../lib/prisma";
import { CreatePropertyInput, UpdatePropertyInput } from "./property.schema";
import { PropertyFilterQuery } from "../../types";
import { paginate } from "../../utils/response";

export const createProperty = async (landlordId: string, input: CreatePropertyInput) => {
  return prisma.property.create({
    data: { landlordId, ...input },
    include: { landlord: { select: { id: true, name: true, phone: true } } },
  });
};

export const getProperties = async (query: PropertyFilterQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;

  if (query.lat && query.lng && query.radius) {
    const lat = Number(query.lat);
    const lng = Number(query.lng);
    const radius = Number(query.radius) || 5000;

    const properties = await prisma.$queryRaw<any[]>`
      SELECT p.*,
        ST_Distance(
          ST_MakePoint(p.lng, p.lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) AS distance,
        json_build_object('id', u.id, 'name', u.name, 'phone', u.phone) AS landlord
      FROM properties p
      JOIN users u ON u.id = p."landlordId"
      WHERE p.status = 'ACTIVE'
        AND ST_DWithin(
          ST_MakePoint(p.lng, p.lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radius}
        )
        ${query.type ? prisma.$queryRaw`AND p.type = ${query.type}::"PropertyType"` : prisma.$queryRaw``}
        ${query.purpose ? prisma.$queryRaw`AND p.purpose = ${query.purpose}::"PropertyPurpose"` : prisma.$queryRaw``}
        ${query.minPrice ? prisma.$queryRaw`AND p.price >= ${Number(query.minPrice)}` : prisma.$queryRaw``}
        ${query.maxPrice ? prisma.$queryRaw`AND p.price <= ${Number(query.maxPrice)}` : prisma.$queryRaw``}
      ORDER BY distance
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
    return { properties, page };
  }

  const where: any = { status: "ACTIVE" };
  if (query.type) where.type = query.type;
  if (query.purpose) where.purpose = query.purpose;
  if (query.city) where.city = { contains: query.city, mode: "insensitive" };
  if (query.district) where.district = { contains: query.district, mode: "insensitive" };
  if (query.bedrooms) where.bedrooms = Number(query.bedrooms);
  if (query.bathrooms) where.bathrooms = { gte: Number(query.bathrooms) };
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      ...paginate(page, limit),
      include: { landlord: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, page, pages: Math.ceil(total / limit) };
};

export const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      landlord: { select: { id: true, name: true, phone: true, avatar: true } },
    },
  });
  if (property) {
    await prisma.property.update({ where: { id }, data: { views: { increment: 1 } } });
  }
  return property;
};

export const updateProperty = async (id: string, landlordId: string, input: UpdatePropertyInput) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property || property.landlordId !== landlordId) throw new Error("Not found or unauthorized");
  return prisma.property.update({ where: { id }, data: input });
};

export const deleteProperty = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property || property.landlordId !== landlordId) throw new Error("Not found or unauthorized");
  return prisma.property.update({ where: { id }, data: { status: "INACTIVE" } });
};

export const getLandlordProperties = async (landlordId: string) => {
  return prisma.property.findMany({
    where: { landlordId, status: { not: "INACTIVE" } },
    orderBy: { createdAt: "desc" },
  });
};

export const adminVerifyProperty = async (id: string, isVerified: boolean) => {
  return prisma.property.update({
    where: { id },
    data: { isVerified, status: isVerified ? "ACTIVE" : "PENDING" },
  });
};
