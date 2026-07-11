import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { createSlug } from "../utils/slug.js";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator.js";

const uniqueSlug = async (name, excludeId) => {
  const base = createSlug(name) || "kategori";
  let slug = base;
  let counter = 2;
  while (await prisma.category.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};

const includeCount = { _count: { select: { menus: { where: { deletedAt: null } } } } };

export const listPublicCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  res.json({ data: categories });
});

export const listAdminCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: includeCount,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  res.json({ data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const input = createCategorySchema.parse(req.body);
  const category = await prisma.category.create({
    data: { ...input, slug: await uniqueSlug(input.name) },
    include: includeCount,
  });
  res.status(201).json({ message: "Kategori berhasil ditambahkan.", data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const input = updateCategorySchema.parse(req.body);
  const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, "Kategori tidak ditemukan.");
  const category = await prisma.category.update({
    where: { id: existing.id },
    data: { ...input, ...(input.name ? { slug: await uniqueSlug(input.name, existing.id) } : {}) },
    include: includeCount,
  });
  res.json({ message: "Kategori berhasil diperbarui.", data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) throw new HttpError(404, "Kategori tidak ditemukan.");
  
  // Count all referencing menus (both active and soft-deleted) to prevent foreign key violation error
  const totalReferencingMenus = await prisma.menu.count({ where: { category: category.slug } });
  if (totalReferencingMenus > 0) {
    throw new HttpError(409, "Kategori masih digunakan oleh menu aktif atau menu terarsip. Pindahkan menu terlebih dahulu.");
  }
  
  await prisma.category.delete({ where: { id: category.id } });
  res.json({ message: "Kategori berhasil dihapus." });
});

