-- CreateTable
CREATE TABLE "user_kitchen_memberships" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_user_id" INTEGER NOT NULL,
    "destination_user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "user_kitchen_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_kitchen_memberships_destination_user_id_status_idx" ON "user_kitchen_memberships"("destination_user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_kitchen_memberships_source_user_id_destination_user_id_key" ON "user_kitchen_memberships"("source_user_id", "destination_user_id");

-- AddForeignKey
ALTER TABLE "user_kitchen_memberships" ADD CONSTRAINT "user_kitchen_memberships_source_user_id_fkey" FOREIGN KEY ("source_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_kitchen_memberships" ADD CONSTRAINT "user_kitchen_memberships_destination_user_id_fkey" FOREIGN KEY ("destination_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
