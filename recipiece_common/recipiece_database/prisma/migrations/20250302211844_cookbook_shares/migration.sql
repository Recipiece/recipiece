-- AlterTable
ALTER TABLE "user_kitchen_memberships" ALTER COLUMN "grant_level" SET DEFAULT 'SELECTIVE';

-- CreateTable
CREATE TABLE "cookbook_shares" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cookbook_id" INTEGER NOT NULL,
    "user_kitchen_membership_id" INTEGER NOT NULL,

    CONSTRAINT "cookbook_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cookbook_shares_cookbook_id_user_kitchen_membership_id_key" ON "cookbook_shares"("cookbook_id", "user_kitchen_membership_id");

-- AddForeignKey
ALTER TABLE "cookbook_shares" ADD CONSTRAINT "cookbook_shares_cookbook_id_fkey" FOREIGN KEY ("cookbook_id") REFERENCES "cookbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cookbook_shares" ADD CONSTRAINT "cookbook_shares_user_kitchen_membership_id_fkey" FOREIGN KEY ("user_kitchen_membership_id") REFERENCES "user_kitchen_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
