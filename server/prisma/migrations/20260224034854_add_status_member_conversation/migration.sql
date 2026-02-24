-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'LEFT');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE';
