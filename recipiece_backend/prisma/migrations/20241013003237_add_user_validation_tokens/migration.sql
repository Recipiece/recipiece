-- AlterTable
ALTER TABLE "users" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_validation_tokens" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purpose" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_validation_tokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_validation_tokens" ADD CONSTRAINT "user_validation_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
