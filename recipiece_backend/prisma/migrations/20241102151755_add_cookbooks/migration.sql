-- CreateTable
CREATE TABLE "cookbooks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cookbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_cookbook_attachments" (
    "recipe_id" INTEGER NOT NULL,
    "cookbook_id" INTEGER NOT NULL,

    CONSTRAINT "recipe_cookbook_attachments_pkey" PRIMARY KEY ("recipe_id","cookbook_id")
);

-- AddForeignKey
ALTER TABLE "cookbooks" ADD CONSTRAINT "cookbooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_cookbook_attachments" ADD CONSTRAINT "recipe_cookbook_attachments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_cookbook_attachments" ADD CONSTRAINT "recipe_cookbook_attachments_cookbook_id_fkey" FOREIGN KEY ("cookbook_id") REFERENCES "cookbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
