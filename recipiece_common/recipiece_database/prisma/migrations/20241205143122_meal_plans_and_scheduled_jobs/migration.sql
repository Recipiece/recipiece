-- AlterTable
ALTER TABLE "recipe_steps" ADD COLUMN     "duration_ms" INTEGER;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "duration_ms" INTEGER,
ADD COLUMN     "servings" INTEGER;

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_recipe_attachments" (
    "recipe_id" INTEGER NOT NULL,
    "meal_plan_id" INTEGER NOT NULL,
    "recipe_scale" INTEGER,
    "duration_ms" INTEGER,
    "order" INTEGER NOT NULL,

    CONSTRAINT "meal_plan_recipe_attachments_pkey" PRIMARY KEY ("recipe_id","meal_plan_id")
);

-- CreateTable
CREATE TABLE "scheduled_notifications" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to_be_run_at" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "args" JSONB,
    "recipe_id" INTEGER NOT NULL,

    CONSTRAINT "scheduled_notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_recipe_attachments" ADD CONSTRAINT "meal_plan_recipe_attachments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_recipe_attachments" ADD CONSTRAINT "meal_plan_recipe_attachments_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_notifications" ADD CONSTRAINT "scheduled_notifications_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
