/*
  Warnings:

  - You are about to drop the column `grant_level` on the `user_kitchen_memberships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_kitchen_memberships" DROP COLUMN "grant_level";

-- DropEnum
DROP TYPE "UserKitchenMembershipGrantLevel";
