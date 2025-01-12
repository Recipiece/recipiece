/*
  Warnings:

  - Changed the type of `status` on the `user_kitchen_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserKitchenMembershipStatus" AS ENUM ('accepted', 'denied', 'pending');

-- AlterTable
ALTER TABLE "user_kitchen_memberships" DROP COLUMN "status",
ADD COLUMN     "status" "UserKitchenMembershipStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "user_kitchen_memberships_destination_user_id_status_idx" ON "user_kitchen_memberships"("destination_user_id", "status");
