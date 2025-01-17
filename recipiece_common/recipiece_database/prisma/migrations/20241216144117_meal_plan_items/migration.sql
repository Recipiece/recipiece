/*
  Warnings:

  - You are about to drop the `meal_plan_recipe_attachments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duration` to the `meal_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `meal_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "meal_plan_recipe_attachments" DROP CONSTRAINT "meal_plan_recipe_attachments_meal_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_plan_recipe_attachments" DROP CONSTRAINT "meal_plan_recipe_attachments_recipe_id_fkey";

-- AlterTable
ALTER TABLE "meal_plans" ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "meal_plan_recipe_attachments";

-- CreateTable
CREATE TABLE "meal_plan_items" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meal_plan_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "freeform_content" TEXT,
    "notes" TEXT,
    "recipe_id" INTEGER,

    CONSTRAINT "meal_plan_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE SET NULL;
