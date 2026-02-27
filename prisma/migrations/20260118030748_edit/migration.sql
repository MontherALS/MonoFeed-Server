-- AlterTable
ALTER TABLE "User" ADD COLUMN     "about" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "isPrivate" BOOLEAN DEFAULT false;
