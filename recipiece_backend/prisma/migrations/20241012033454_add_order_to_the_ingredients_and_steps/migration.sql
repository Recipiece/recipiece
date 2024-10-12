/*
  Warnings:

  - Added the required column `order` to the `recipe_ingredients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `recipe_steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recipe_ingredients" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "recipe_steps" ADD COLUMN     "order" INTEGER NOT NULL;
