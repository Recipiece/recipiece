-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE CITEXT using email::citext,
ALTER COLUMN "username" SET DATA TYPE CITEXT using email::citext;
