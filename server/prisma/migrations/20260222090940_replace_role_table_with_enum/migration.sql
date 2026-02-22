/*
  Warnings:

  - You are about to drop the column `roleId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('PEER', 'ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_roleId_fkey";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "roleId",
ADD COLUMN     "role" "RoleName" NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE "Role";
