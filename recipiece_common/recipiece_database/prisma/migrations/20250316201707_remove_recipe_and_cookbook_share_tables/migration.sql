/*
  Warnings:

  - You are about to drop the `cookbook_shares` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recipe_shares` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cookbook_shares" DROP CONSTRAINT "cookbook_shares_cookbook_id_fkey";

-- DropForeignKey
ALTER TABLE "cookbook_shares" DROP CONSTRAINT "cookbook_shares_user_kitchen_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_shares" DROP CONSTRAINT "recipe_shares_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_shares" DROP CONSTRAINT "recipe_shares_user_kitchen_membership_id_fkey";

-- DropTable
DROP TABLE "cookbook_shares";

-- DropTable
DROP TABLE "recipe_shares";
