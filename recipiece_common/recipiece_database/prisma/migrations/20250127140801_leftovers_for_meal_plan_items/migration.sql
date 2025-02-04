/*
  Warnings:

  - You are about to drop the column `label` on the `meal_plan_items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[leftover_of_meal_plan_item_id]` on the table `meal_plan_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "meal_plan_items" DROP COLUMN "label",
ADD COLUMN     "leftover_of_meal_plan_item_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_items_leftover_of_meal_plan_item_id_key" ON "meal_plan_items"("leftover_of_meal_plan_item_id");

-- AddForeignKey
ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_leftover_of_meal_plan_item_id_fkey" FOREIGN KEY ("leftover_of_meal_plan_item_id") REFERENCES "meal_plan_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
