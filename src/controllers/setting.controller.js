import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { updateSettingSchema } from "../validators/setting.validator.js";

const getSettings = () => prisma.siteSetting.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });

export const readSettings = asyncHandler(async (_req, res) => {
  res.json({ data: await getSettings() });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const input = updateSettingSchema.parse(req.body);
  const settings = await prisma.siteSetting.upsert({
    where: { id: "main" },
    update: input,
    create: { id: "main", ...input },
  });
  res.json({ message: "Pengaturan berhasil disimpan.", data: settings });
});

