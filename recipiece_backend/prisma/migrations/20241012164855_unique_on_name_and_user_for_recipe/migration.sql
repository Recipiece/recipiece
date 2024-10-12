/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name]` on the table `recipes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "recipes_user_id_name_key" ON "recipes"("user_id", "name");
