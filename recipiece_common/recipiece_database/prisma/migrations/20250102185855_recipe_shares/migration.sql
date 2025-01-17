-- CreateTable
CREATE TABLE "recipe_shares" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipe_id" INTEGER NOT NULL,
    "user_kitchen_membership_id" INTEGER NOT NULL,

    CONSTRAINT "recipe_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_shares_recipe_id_user_kitchen_membership_id_key" ON "recipe_shares"("recipe_id", "user_kitchen_membership_id");

-- AddForeignKey
ALTER TABLE "recipe_shares" ADD CONSTRAINT "recipe_shares_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_shares" ADD CONSTRAINT "recipe_shares_user_kitchen_membership_id_fkey" FOREIGN KEY ("user_kitchen_membership_id") REFERENCES "user_kitchen_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
