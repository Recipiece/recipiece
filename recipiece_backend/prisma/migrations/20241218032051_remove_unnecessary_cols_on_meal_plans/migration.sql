/*
  Warnings:

  - You are about to drop the column `duration` on the `meal_plans` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `meal_plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meal_plan_items" ADD COLUMN     "label" TEXT;

-- AlterTable
ALTER TABLE "meal_plans" DROP COLUMN "duration",
DROP COLUMN "start_date";
