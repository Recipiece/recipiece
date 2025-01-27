-- CreateTable
CREATE TABLE "meal_plan_shares" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meal_plan_id" INTEGER NOT NULL,
    "user_kitchen_membership_id" INTEGER NOT NULL,

    CONSTRAINT "meal_plan_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_shares_meal_plan_id_user_kitchen_membership_id_key" ON "meal_plan_shares"("meal_plan_id", "user_kitchen_membership_id");

-- AddForeignKey
ALTER TABLE "meal_plan_shares" ADD CONSTRAINT "meal_plan_shares_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_shares" ADD CONSTRAINT "meal_plan_shares_user_kitchen_membership_id_fkey" FOREIGN KEY ("user_kitchen_membership_id") REFERENCES "user_kitchen_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
