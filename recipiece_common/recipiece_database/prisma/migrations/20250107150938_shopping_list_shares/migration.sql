-- DropIndex
DROP INDEX "user_kitchen_memberships_destination_user_id_status_idx";

-- CreateTable
CREATE TABLE "shopping_list_shares" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shopping_list_id" INTEGER NOT NULL,
    "user_kitchen_membership_id" INTEGER NOT NULL,

    CONSTRAINT "shopping_list_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_shares_shopping_list_id_user_kitchen_membersh_key" ON "shopping_list_shares"("shopping_list_id", "user_kitchen_membership_id");

-- CreateIndex
CREATE INDEX "user_kitchen_memberships_status_destination_user_id_idx" ON "user_kitchen_memberships"("status", "destination_user_id");

-- CreateIndex
CREATE INDEX "user_kitchen_memberships_status_source_user_id_idx" ON "user_kitchen_memberships"("status", "source_user_id");

-- AddForeignKey
ALTER TABLE "shopping_list_shares" ADD CONSTRAINT "shopping_list_shares_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_shares" ADD CONSTRAINT "shopping_list_shares_user_kitchen_membership_id_fkey" FOREIGN KEY ("user_kitchen_membership_id") REFERENCES "user_kitchen_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
