-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "apiUrl" TEXT,
ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "syncInterval" INTEGER;
