import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createSlug } from "../src/utils/slug.js";

const required = ["DATABASE_URL", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} wajib diisi di .env`);
}
if (process.env.ADMIN_PASSWORD.length < 12) {
  throw new Error("ADMIN_PASSWORD minimal 12 karakter.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

await import("../menu-data.js");
const menuItems = globalThis.menuItems || [];

try {
  const initialCategories = [
    { name: "Makanan", slug: "main", sortOrder: 1 },
    { name: "Snack", slug: "snack", sortOrder: 2 },
    { name: "Minuman", slug: "drink", sortOrder: 3 },
  ];
  for (const category of initialCategories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
  }
  await prisma.siteSetting.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      ordersEnabled: true,
      heroTitle: "Makan, ngemil, ngopi — semua ada di sini.",
      heroDescription: "Pilih makanan, snack, atau minuman favoritmu langsung dari HP.",
    },
  });
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
    update: { name: process.env.ADMIN_NAME, passwordHash, role: "ADMIN", isActive: true },
    create: {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const item of menuItems) {
    const slug = createSlug(item.name);
    await prisma.menu.upsert({
      where: { slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.image,
        isAvailable: true,
        deletedAt: null,
      },
      create: {
        slug,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.image,
      },
    });
  }

  const initialPaymentMethods = [
    {
      id: "582e3c0e-40cc-402a-a92c-569d38096f4b",
      name: "Bayar di Kasir",
      description: "Bayar langsung di kasir setelah pesanan dikonfirmasi.",
      instruction: "Silakan lakukan pembayaran langsung di kasir Panama Corner setelah pesanan dikonfirmasi.",
      type: "offline",
      isRecommended: true,
      isActive: true,
      sortOrder: 1,
      accounts: null,
      note: null,
      qrImage: null,
    },
    {
      id: "b019808d-e59e-49fe-a42e-826694e9f743",
      name: "QRIS",
      description: "Scan QRIS, lalu kirim bukti pembayaran lewat WhatsApp.",
      instruction: "Silakan scan QRIS Panama Corner sesuai total pesanan. Setelah membayar, kirim screenshot bukti pembayaran di chat WhatsApp ini.",
      type: "qris",
      qrImage: "/assets/payment/qris-panama-corner.jpg",
      isRecommended: false,
      isActive: true,
      sortOrder: 2,
      accounts: null,
      note: "Pastikan nominal pembayaran sesuai total pesanan.",
    },
    {
      id: "a7b05423-f368-4a6f-bcfb-465452d3d99e",
      name: "Transfer Bank",
      description: "Transfer ke rekening resto, lalu kirim bukti pembayaran.",
      instruction: "Silakan transfer sesuai total pesanan ke salah satu rekening Panama Corner. Setelah membayar, kirim screenshot bukti transfer di chat WhatsApp ini.",
      type: "bank",
      isRecommended: false,
      isActive: true,
      sortOrder: 3,
      accounts: [
        {
          bankName: "BCA",
          accountNumber: "1234567890",
          accountHolder: "PANAMA CORNER",
        },
        {
          bankName: "BRI",
          accountNumber: "9876543210",
          accountHolder: "PANAMA CORNER",
        },
      ],
      note: "Pesanan diproses setelah pembayaran dikonfirmasi oleh kasir.",
      qrImage: null,
    },
  ];

  for (const method of initialPaymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { id: method.id },
      update: method,
      create: method,
    });
  }

  console.log(`Seed selesai: 1 admin, ${menuItems.length} menu, dan ${initialPaymentMethods.length} metode pembayaran diproses.`);
} finally {
  await prisma.$disconnect();
}

