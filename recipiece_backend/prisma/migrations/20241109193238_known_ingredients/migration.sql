/*
  Warnings:

  - A unique constraint covering the columns `[ingredient_name]` on the table `known_ingredients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "known_ingredients_ingredient_name_key" ON "known_ingredients"("ingredient_name");
