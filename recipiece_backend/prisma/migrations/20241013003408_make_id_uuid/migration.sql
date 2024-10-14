/*
  Warnings:

  - The primary key for the `user_validation_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "user_validation_tokens" DROP CONSTRAINT "user_validation_tokens_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_validation_tokens_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_validation_tokens_id_seq";
