/*
  Warnings:

  - The primary key for the `Medicines` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Members` table. All the data in the column will be lost.
  - The `gender` column on the `Members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SupplierCredits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `status` on the `SupplierCredits` table. All the data in the column will be lost.
  - The primary key for the `Suppliers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Users` table. All the data in the column will be lost.
  - The `status` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `FirstName` to the `Members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `LastName` to the `Members` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `Members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `created_by` to the `SupplierCredits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_type` to the `SupplierCredits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `SupplierCredits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FirstName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `LastName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `Users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('LOAN', 'PAYMENT', 'PURCHASE');

-- DropForeignKey
ALTER TABLE "Medicines" DROP CONSTRAINT "Medicines_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "Members" DROP CONSTRAINT "Members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Returns" DROP CONSTRAINT "Returns_medicine_id_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_medicine_id_fkey";

-- DropForeignKey
ALTER TABLE "SupplierCredits" DROP CONSTRAINT "SupplierCredits_supplier_id_fkey";

-- AlterTable
ALTER TABLE "Medicines" DROP CONSTRAINT "Medicines_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "supplier_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Medicines_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Medicines_id_seq";

-- AlterTable
ALTER TABLE "Members" DROP CONSTRAINT "Members_pkey",
DROP COLUMN "name",
ADD COLUMN     "FirstName" TEXT NOT NULL,
ADD COLUMN     "LastName" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "phone" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender",
ALTER COLUMN "dob" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ADD CONSTRAINT "Members_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Members_id_seq";

-- AlterTable
ALTER TABLE "Returns" ALTER COLUMN "medicine_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Sales" ALTER COLUMN "medicine_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SupplierCredits" DROP CONSTRAINT "SupplierCredits_pkey",
DROP COLUMN "status",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transaction_type" "TransactionType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "supplier_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SupplierCredits_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SupplierCredits_id_seq";

-- AlterTable
ALTER TABLE "Suppliers" DROP CONSTRAINT "Suppliers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ADD CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Suppliers_id_seq";

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "name",
ADD COLUMN     "FirstName" TEXT NOT NULL,
ADD COLUMN     "LastName" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Users_id_seq";

-- AddForeignKey
ALTER TABLE "Members" ADD CONSTRAINT "Members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicines" ADD CONSTRAINT "Medicines_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "Medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "Medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCredits" ADD CONSTRAINT "SupplierCredits_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCredits" ADD CONSTRAINT "SupplierCredits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
