-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "hero_description" VARCHAR(500) NOT NULL DEFAULT 'Pilih makanan, snack, atau minuman favoritmu langsung dari HP.',
ADD COLUMN     "hero_title" VARCHAR(180) NOT NULL DEFAULT 'Makan, ngemil, ngopi — semua ada di sini.';
