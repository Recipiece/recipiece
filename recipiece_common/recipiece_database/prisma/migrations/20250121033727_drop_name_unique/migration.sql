-- DropIndex
DROP INDEX "cookbooks_user_id_name_key";

-- DropIndex
DROP INDEX "shopping_lists_user_id_name_key";

-- CreateIndex
CREATE INDEX "cookbooks_user_id_name_idx" ON "cookbooks"("user_id", "name");

-- CreateIndex
CREATE INDEX "shopping_lists_user_id_name_idx" ON "shopping_lists"("user_id", "name");
