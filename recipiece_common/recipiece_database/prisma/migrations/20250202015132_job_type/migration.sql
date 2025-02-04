/*
  Warnings:

  - Added the required column `type` to the `side_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "side_jobs" ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "side_jobs_type_idx" ON "side_jobs"("type");
