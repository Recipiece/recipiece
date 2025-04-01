/*
  Warnings:

  - You are about to drop the `background_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scheduled_notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "background_jobs" DROP CONSTRAINT "background_jobs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "scheduled_notifications" DROP CONSTRAINT "scheduled_notifications_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "timers" DROP CONSTRAINT "timers_user_id_fkey";

-- DropTable
DROP TABLE "background_jobs";

-- DropTable
DROP TABLE "scheduled_notifications";

-- DropTable
DROP TABLE "timers";

-- CreateTable
CREATE TABLE "side_jobs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "job_data" JSONB NOT NULL,

    CONSTRAINT "side_jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "side_jobs" ADD CONSTRAINT "side_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
