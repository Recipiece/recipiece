-- CreateTable
CREATE TABLE "user_tags" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "user_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_tag_attachments" (
    "recipe_id" INTEGER NOT NULL,
    "user_tag_id" INTEGER NOT NULL,

    CONSTRAINT "recipe_tag_attachments_pkey" PRIMARY KEY ("recipe_id","user_tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_tags_user_id_content_key" ON "user_tags"("user_id", "content");

-- AddForeignKey
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tag_attachments" ADD CONSTRAINT "recipe_tag_attachments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tag_attachments" ADD CONSTRAINT "recipe_tag_attachments_user_tag_id_fkey" FOREIGN KEY ("user_tag_id") REFERENCES "user_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
