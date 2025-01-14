/*
  Warnings:

  - You are about to drop the column `private` on the `cookbooks` table. All the data in the column will be lost.
  - You are about to drop the column `private` on the `recipes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cookbooks" DROP COLUMN "private";

-- AlterTable
ALTER TABLE "recipes" DROP COLUMN "private";
