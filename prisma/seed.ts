import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.savedProperty.deleteMany();
  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.property.deleteMany();
  await prisma.kyc.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Cleared existing data");

  // Create users
  const users = await Promise.all([
    // Tenants
    prisma.user.create({
      data: {
        name: "Ramesh Poudel",
        phone: "9841234567",
        email: "ramesh@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "TENANT",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Sharma",
        phone: "9842234567",
        email: "priya@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "TENANT",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: "Nikesh Bhatt",
        phone: "9843234567",
        email: "nikesh@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "TENANT",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: "Deepa Thapa",
        phone: "9844234567",
        email: "deepa@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "TENANT",
        isActive: true,
      },
    }),
    // Landlords
    prisma.user.create({
      data: {
        name: "Rajesh Landlord",
        phone: "9845234567",
        email: "rajesh@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "LANDLORD",
        isActive: true,
        kyc: {
          create: {
            citizenshipNo: "12-34-56-78901",
            citizenshipFront: "https://via.placeholder.com/300x200?text=ID+Front",
            citizenshipBack: "https://via.placeholder.com/300x200?text=ID+Back",
            selfie: "https://via.placeholder.com/300x300?text=Selfie",
            status: "VERIFIED",
            verifiedAt: new Date(),
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Sunita Property Owner",
        phone: "9846234567",
        email: "sunita@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "LANDLORD",
        isActive: true,
        kyc: {
          create: {
            citizenshipNo: "23-45-67-89012",
            citizenshipFront: "https://via.placeholder.com/300x200?text=ID+Front",
            citizenshipBack: "https://via.placeholder.com/300x200?text=ID+Back",
            selfie: "https://via.placeholder.com/300x300?text=Selfie",
            status: "VERIFIED",
            verifiedAt: new Date(),
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Kiran Builder",
        phone: "9847234567",
        email: "kiran@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "LANDLORD",
        isActive: true,
        kyc: {
          create: {
            citizenshipNo: "34-56-78-90123",
            citizenshipFront: "https://via.placeholder.com/300x200?text=ID+Front",
            citizenshipBack: "https://via.placeholder.com/300x200?text=ID+Back",
            selfie: "https://via.placeholder.com/300x300?text=Selfie",
            status: "VERIFIED",
            verifiedAt: new Date(),
          },
        },
      },
    }),
    // Admin
    prisma.user.create({
      data: {
        name: "Admin User",
        phone: "9848234567",
        email: "admin@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "ADMIN",
        isActive: true,
      },
    }),
    // Extra tenants
    prisma.user.create({
      data: {
        name: "Anita Khanal",
        phone: "9849234567",
        email: "anita@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "TENANT",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: "Bhuvan Singh",
        phone: "9850234567",
        email: "bhuvan@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        role: "TENANT",
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ Created ${users.length} users`);

  const [tenant1, tenant2, tenant3, tenant4, landlord1, landlord2, landlord3, admin, tenant5, tenant6] = users;

  // Create properties
  const properties = await Promise.all([
    // Landlord 1 - Rajesh
    prisma.property.create({
      data: {
        landlordId: landlord1.id,
        title: "2BHK Flat in Baneshwor",
        description: "Spacious 2-bedroom flat with attached bathroom, parking, and water supply. Perfect for families.",
        type: "FLAT",
        purpose: "RENT",
        status: "ACTIVE",
        price: 18000,
        negotiable: true,
        deposit: 36000,
        address: "Baneshwor Tole",
        city: "Kathmandu",
        district: "Kathmandu",
        lat: 27.688,
        lng: 85.341,
        area: 1200,
        floor: 3,
        totalFloors: 5,
        bedrooms: 2,
        bathrooms: 1,
        features: {
          attachedBathroom: true,
          parking: true,
          furnished: false,
          waterSupply: true,
          electricity: true,
          internet: false,
          security: true,
          lift: true,
          garden: false,
          rooftopAccess: false,
        },
        images: [ "https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: true,
        views: 45,
      },
    }),
    prisma.property.create({
      data: {
        landlordId: landlord1.id,
        title: "Studio Room in Thamel",
        description: "Cozy studio room ideal for students. Walking distance to shops and restaurants.",
        type: "ROOM",
        purpose: "RENT",
        status: "ACTIVE",
        price: 8000,
        negotiable: false,
        address: "Thamel",
        city: "Kathmandu",
        district: "Kathmandu",
        lat: 27.708,
        lng: 85.294,
        area: 300,
        bedrooms: 1,
        bathrooms: 1,
        features: {
          attachedBathroom: true,
          parking: false,
          furnished: true,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: false,
          lift: false,
          garden: false,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"
],
        isVerified: true,
        views: 120,
      },
    }),
    // Landlord 2 - Sunita
    prisma.property.create({
      data: {
        landlordId: landlord2.id,
        title: "3BHK House in Lalitpur",
        description: "Independent house with garden, parking, and modern amenities. Great for families.",
        type: "HOUSE",
        purpose: "BOTH",
        status: "ACTIVE",
        price: 25000,
        negotiable: true,
        deposit: 50000,
        address: "Jawalakhel",
        city: "Lalitpur",
        district: "Lalitpur",
        lat: 27.631,
        lng: 85.331,
        area: 2000,
        floor: 1,
        totalFloors: 1,
        bedrooms: 3,
        bathrooms: 2,
        features: {
          attachedBathroom: true,
          parking: true,
          furnished: false,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: true,
          lift: false,
          garden: true,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"
],
        isVerified: true,
        views: 78,
      },
    }),
    prisma.property.create({
      data: {
        landlordId: landlord2.id,
        title: "Commercial Space in Bhaktapur",
        description: "Prime commercial space suitable for office, shop, or clinic. High foot traffic area.",
        type: "COMMERCIAL",
        purpose: "RENT",
        status: "ACTIVE",
        price: 35000,
        negotiable: true,
        address: "Durbar Square",
        city: "Bhaktapur",
        district: "Bhaktapur",
        lat: 27.63,
        lng: 85.429,
        area: 1500,
        floor: 2,
        totalFloors: 4,
        features: {
          attachedBathroom: true,
          parking: true,
          furnished: false,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: true,
          lift: true,
          garden: false,
          rooftopAccess: true,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: true,
        views: 92,
      },
    }),
    // Landlord 3 - Kiran
    prisma.property.create({
      data: {
        landlordId: landlord3.id,
        title: "Land for Sale in Kaski",
        description: "Scenic land plot with mountain views. Ideal for residential or commercial project.",
        type: "LAND",
        purpose: "SALE",
        status: "ACTIVE",
        price: 2500000,
        negotiable: true,
        address: "Pokhara Valley",
        city: "Pokhara",
        district: "Kaski",
        lat: 28.196,
        lng: 83.946,
        area: 5000,
        features: {
          attachedBathroom: false,
          parking: false,
          furnished: false,
          waterSupply: true,
          electricity: true,
          internet: false,
          security: false,
          lift: false,
          garden: false,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: true,
        views: 156,
      },
    }),
    prisma.property.create({
      data: {
        landlordId: landlord3.id,
        title: "1BHK Apartment in Pokhara",
        description: "Cozy 1-bedroom apartment with lake view. Fully furnished and ready to move.",
        type: "FLAT",
        purpose: "RENT",
        status: "PENDING",
        price: 12000,
        negotiable: false,
        address: "Lakeside",
        city: "Pokhara",
        district: "Kaski",
        lat: 28.21,
        lng: 83.98,
        area: 600,
        floor: 2,
        bedrooms: 1,
        bathrooms: 1,
        features: {
          attachedBathroom: true,
          parking: true,
          furnished: true,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: false,
          lift: false,
          garden: false,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: false,
        views: 34,
      },
    }),
    // More properties with varied data
    prisma.property.create({
      data: {
        landlordId: landlord1.id,
        title: "2BHK in New Baneshwor",
        description: "Modern 2BHK with elevator, parking, and security system.",
        type: "FLAT",
        purpose: "RENT",
        status: "RENTED",
        price: 20000,
        negotiable: false,
        deposit: 40000,
        address: "New Baneshwor",
        city: "Kathmandu",
        district: "Kathmandu",
        lat: 27.685,
        lng: 85.355,
        area: 1100,
        floor: 4,
        totalFloors: 6,
        bedrooms: 2,
        bathrooms: 1,
        features: {
          attachedBathroom: true,
          parking: true,
          furnished: false,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: true,
          lift: true,
          garden: false,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: true,
        views: 89,
      },
    }),
    prisma.property.create({
      data: {
        landlordId: landlord2.id,
        title: "Duplex in Bhaktapur",
        description: "Spacious duplex with 3 bedrooms, modern kitchen, and garden.",
        type: "HOUSE",
        purpose: "RENT",
        status: "ACTIVE",
        price: 22000,
        negotiable: true,
        deposit: 44000,
        address: "Suryabinayak",
        city: "Bhaktapur",
        district: "Bhaktapur",
        lat: 27.645,
        lng: 85.41,
        area: 1800,
        floor: 1,
        totalFloors: 2,
        bedrooms: 3,
        bathrooms: 2,
        features: {
          attachedBathroom: true,
          parking: true,
          furnished: false,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: true,
          lift: false,
          garden: true,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: true,
        views: 67,
      },
    }),
    prisma.property.create({
      data: {
        landlordId: landlord3.id,
        title: "Room Share in Kathmandu",
        description: "Share a room in a well-maintained house. Utilities included.",
        type: "ROOM",
        purpose: "RENT",
        status: "ACTIVE",
        price: 6000,
        negotiable: false,
        address: "Naxal",
        city: "Kathmandu",
        district: "Kathmandu",
        lat: 27.717,
        lng: 85.314,
        area: 250,
        bedrooms: 1,
        bathrooms: 1,
        features: {
          attachedBathroom: false,
          parking: false,
          furnished: true,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: false,
          lift: false,
          garden: false,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"," https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: true,
        views: 203,
      },
    }),
    prisma.property.create({
      data: {
        landlordId: landlord1.id,
        title: "Office Space in Brikshman Marg",
        description: "Modern office with open plan layout, conference room, and pantry.",
        type: "COMMERCIAL",
        purpose: "RENT",
        status: "ACTIVE",
        price: 40000,
        negotiable: true,
        address: "Brikshman Marg",
        city: "Kathmandu",
        district: "Kathmandu",
        lat: 27.73,
        lng: 85.317,
        area: 2000,
        floor: 3,
        totalFloors: 5,
        features: {
          attachedBathroom: true,
          parking: true,
          furnished: true,
          waterSupply: true,
          electricity: true,
          internet: true,
          security: true,
          lift: true,
          garden: false,
          rooftopAccess: false,
        },
        images: [" https://res.cloudinary.com/duqfwlcf7/image/upload/v1784557025/ZXMtcGhvdG8uanBn_pqdosc.jpg"],
        isVerified: true,
        views: 156,
      },
    }),
  ]);

  console.log(`✓ Created ${properties.length} properties`);

  // Create leases
  const leases = await Promise.all([
    prisma.lease.create({
      data: {
        propertyId: properties[6].id, // 2BHK in New Baneshwor (RENTED)
        tenantId: tenant1.id,
        monthlyRent: 20000,
        deposit: 40000,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2026-01-14"),
        status: "ACTIVE",
      },
    }),
    prisma.lease.create({
      data: {
        propertyId: properties[1].id, // Studio Room
        tenantId: tenant2.id,
        monthlyRent: 8000,
        deposit: 16000,
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-07-31"),
        status: "ACTIVE",
      },
    }),
    prisma.lease.create({
      data: {
        propertyId: properties[2].id, // 3BHK House
        tenantId: tenant3.id,
        monthlyRent: 25000,
        deposit: 50000,
        startDate: new Date("2024-12-01"),
        endDate: new Date("2025-11-30"),
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`✓ Created ${leases.length} leases`);

  // Create payments
  await Promise.all([
    prisma.payment.create({
      data: {
        leaseId: leases[0].id,
        amount: 20000,
        forMonth: new Date("2025-03-01"),
        status: "PAID",
        gateway: "KHALTI",
        txnId: "TXN123456789",
        paidAt: new Date("2025-03-05"),
        dueDate: new Date("2025-03-05"),
      },
    }),
    prisma.payment.create({
      data: {
        leaseId: leases[0].id,
        amount: 20000,
        forMonth: new Date("2025-04-01"),
        status: "PENDING",
        gateway: "KHALTI",
        dueDate: new Date("2025-04-05"),
      },
    }),
    prisma.payment.create({
      data: {
        leaseId: leases[1].id,
        amount: 8000,
        forMonth: new Date("2025-03-01"),
        status: "PAID",
        gateway: "ESEWA",
        txnId: "ESW987654321",
        paidAt: new Date("2025-03-02"),
        dueDate: new Date("2025-03-05"),
      },
    }),
  ]);

  console.log(`✓ Created payments`);

  // Create saved properties
  await Promise.all([
    prisma.savedProperty.create({
      data: {
        userId: tenant1.id,
        propertyId: properties[0].id,
      },
    }),
    prisma.savedProperty.create({
      data: {
        userId: tenant1.id,
        propertyId: properties[2].id,
      },
    }),
    prisma.savedProperty.create({
      data: {
        userId: tenant2.id,
        propertyId: properties[3].id,
      },
    }),
    prisma.savedProperty.create({
      data: {
        userId: tenant4.id,
        propertyId: properties[4].id,
      },
    }),
    prisma.savedProperty.create({
      data: {
        userId: tenant5.id,
        propertyId: properties[7].id,
      },
    }),
  ]);

  console.log(`✓ Created saved properties`);

  // Create messages
  await Promise.all([
    prisma.message.create({
      data: {
        senderId: tenant1.id,
        receiverId: landlord1.id,
        propertyId: properties[0].id,
        content: "Hi, is the flat still available? I'm interested in viewing.",
        isRead: true,
      },
    }),
    prisma.message.create({
      data: {
        senderId: landlord1.id,
        receiverId: tenant1.id,
        propertyId: properties[0].id,
        content: "Yes, it's available! We can arrange a viewing tomorrow at 3 PM.",
        isRead: true,
      },
    }),
    prisma.message.create({
      data: {
        senderId: tenant2.id,
        receiverId: landlord1.id,
        propertyId: properties[1].id,
        content: "What's the earliest I can move in?",
        isRead: false,
      },
    }),
    prisma.message.create({
      data: {
        senderId: tenant3.id,
        receiverId: landlord2.id,
        propertyId: properties[2].id,
        content: "Can we negotiate the rent a bit? My budget is 24000.",
        isRead: false,
      },
    }),
  ]);

  console.log(`✓ Created messages`);

  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📊 Data Summary:");
  console.log(`   • Users: ${users.length} (4 Tenants, 3 Landlords, 1 Admin, 2 Extra Tenants)`);
  console.log(`   • Properties: ${properties.length}`);
  console.log(`   • Leases: ${leases.length}`);
  console.log(`   • Payments: 3`);
  console.log(`   • Saved Properties: 5`);
  console.log(`   • Messages: 4`);

  console.log("\n🔑 Test Credentials:");
  console.log("   Tenant: 9841234567 / password123");
  console.log("   Landlord: 9845234567 / password123");
  console.log("   Admin: 9848234567 / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
