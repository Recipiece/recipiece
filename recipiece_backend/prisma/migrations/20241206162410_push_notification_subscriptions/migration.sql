-- CreateTable
CREATE TABLE "user_push_notification_subscriptions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscription_data" JSONB NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_push_notification_subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_push_notification_subscriptions" ADD CONSTRAINT "user_push_notification_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
