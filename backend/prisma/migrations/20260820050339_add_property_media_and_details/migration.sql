-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "description" TEXT,
ADD COLUMN     "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "imageUrl" TEXT;
