/*
  Warnings:

  - A unique constraint covering the columns `[conversationKey]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "conversationKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_conversationKey_key" ON "Conversation"("conversationKey");
