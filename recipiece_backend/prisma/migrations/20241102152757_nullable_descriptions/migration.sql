-- AlterTable
ALTER TABLE "cookbooks" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "recipes" ALTER COLUMN "description" DROP NOT NULL;
