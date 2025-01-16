/*
  Warnings:

  - Added the required column `content` to the `shopping_list_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shopping_list_items" ADD COLUMN     "content" TEXT NOT NULL;
