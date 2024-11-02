/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name]` on the table `cookbooks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cookbooks_user_id_name_key" ON "cookbooks"("user_id", "name");
