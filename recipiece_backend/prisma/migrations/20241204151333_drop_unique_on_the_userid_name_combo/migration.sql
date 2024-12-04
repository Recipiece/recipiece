-- DropIndex
DROP INDEX "recipes_user_id_name_key";

-- CreateIndex
CREATE INDEX "recipes_user_id_name_idx" ON "recipes"("user_id", "name");
