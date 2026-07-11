import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { createSlug } from "../utils/slug.js";
import { createMenuSchema, updateMenuSchema } from "../validators/menu.validator.js";

const serializeMenu = (menu) => ({ ...menu, price: Number(menu.price), categoryName: menu.categoryRef?.name });

const uniqueSlug = async (name, excludeId) => {
  const base = createSlug(name) || "menu";
  let slug = base;
  let counter = 2;

  while (
    await prisma.menu.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};

export const listPublicMenus = asyncHandler(async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const search = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
  const menus = await prisma.menu.findMany({
    where: {
      deletedAt: null,
      isAvailable: true,
      categoryRef: { isActive: true },
      ...(category ? { category } : {}),
      ...(search
        ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] }
        : {}),
    },
    include: { categoryRef: { select: { name: true } } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  res.json({ data: menus.map(serializeMenu) });
});

export const listAdminMenus = asyncHandler(async (_req, res) => {
  const menus = await prisma.menu.findMany({
    where: { deletedAt: null },
    include: { categoryRef: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: menus.map(serializeMenu) });
});

export const createMenu = asyncHandler(async (req, res) => {
  const input = createMenuSchema.parse(req.body);
  const category = await prisma.category.findFirst({ where: { slug: input.category, isActive: true } });
  if (!category) throw new HttpError(400, "Kategori menu tidak valid atau sedang nonaktif.");
  const menu = await prisma.menu.create({
    data: { ...input, slug: await uniqueSlug(input.name) },
    include: { categoryRef: { select: { name: true } } },
  });
  res.status(201).json({ message: "Menu berhasil ditambahkan.", data: serializeMenu(menu) });
});

export const updateMenu = asyncHandler(async (req, res) => {
  const input = updateMenuSchema.parse(req.body);
  const existing = await prisma.menu.findFirst({ where: { id: req.params.id, deletedAt: null } });
  if (!existing) throw new HttpError(404, "Menu tidak ditemukan.");

  if (input.category) {
    const category = await prisma.category.findFirst({ where: { slug: input.category, isActive: true } });
    if (!category) throw new HttpError(400, "Kategori menu tidak valid atau sedang nonaktif.");
  }
  const menu = await prisma.menu.update({
    where: { id: existing.id },
    data: { ...input, ...(input.name ? { slug: await uniqueSlug(input.name, existing.id) } : {}) },
    include: { categoryRef: { select: { name: true } } },
  });
  res.json({ message: "Menu berhasil diperbarui.", data: serializeMenu(menu) });
});

export const deleteMenu = asyncHandler(async (req, res) => {
  const existing = await prisma.menu.findFirst({ where: { id: req.params.id, deletedAt: null } });
  if (!existing) throw new HttpError(404, "Menu tidak ditemukan.");

  await prisma.menu.update({
    where: { id: existing.id },
    data: { deletedAt: new Date(), isAvailable: false },
  });
  res.json({ message: "Menu berhasil dihapus." });
});
