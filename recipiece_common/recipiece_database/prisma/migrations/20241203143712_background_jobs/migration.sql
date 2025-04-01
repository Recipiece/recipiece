-- CreateTable
CREATE TABLE "background_jobs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "result" TEXT NOT NULL DEFAULT 'pending',
    "purpose" TEXT NOT NULL,
    "args" JSONB,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
