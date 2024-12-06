-- CreateTable
CREATE TABLE "timers" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_ms" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "timers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "timers" ADD CONSTRAINT "timers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
