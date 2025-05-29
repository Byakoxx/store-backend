/*
  Warnings:

  - Added the required column `city` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
