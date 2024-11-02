-- DropForeignKey
ALTER TABLE "recipe_cookbook_attachments" DROP CONSTRAINT "recipe_cookbook_attachments_cookbook_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_cookbook_attachments" DROP CONSTRAINT "recipe_cookbook_attachments_recipe_id_fkey";

-- AddForeignKey
ALTER TABLE "recipe_cookbook_attachments" ADD CONSTRAINT "recipe_cookbook_attachments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_cookbook_attachments" ADD CONSTRAINT "recipe_cookbook_attachments_cookbook_id_fkey" FOREIGN KEY ("cookbook_id") REFERENCES "cookbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
