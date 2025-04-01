-- AlterTable
ALTER TABLE "meal_plans" ADD COLUMN     "configuration" JSONB NOT NULL DEFAULT '{}';
update meal_plans set configuration = '{}'::jsonb where true;
