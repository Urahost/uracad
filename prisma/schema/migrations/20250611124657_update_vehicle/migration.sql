-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "balance" DOUBLE PRECISION,
ADD COLUMN     "customName" TEXT,
ADD COLUMN     "depotPrice" DOUBLE PRECISION,
ADD COLUMN     "drivingDistance" DOUBLE PRECISION,
ADD COLUMN     "financeTime" TIMESTAMP(3),
ADD COLUMN     "glovebox" JSONB,
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "impoundFee" DOUBLE PRECISION,
ADD COLUMN     "impoundReason" TEXT,
ADD COLUMN     "impoundTime" TIMESTAMP(3),
ADD COLUMN     "impoundType" TEXT,
ADD COLUMN     "impoundedBy" TEXT,
ADD COLUMN     "impoundedTime" TIMESTAMP(3),
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job" TEXT,
ADD COLUMN     "paymentAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentsLeft" INTEGER,
ADD COLUMN     "sharedGarageId" TEXT,
ADD COLUMN     "stored" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "storedInGang" TEXT,
ADD COLUMN     "trunk" JSONB,
ADD COLUMN     "vehicle" TEXT,
ADD COLUMN     "wheelclamp" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "state" SET DEFAULT 'out';

-- CreateIndex
CREATE INDEX "Vehicle_garage_idx" ON "Vehicle"("garage");

-- CreateIndex
CREATE INDEX "Vehicle_type_idx" ON "Vehicle"("type");
