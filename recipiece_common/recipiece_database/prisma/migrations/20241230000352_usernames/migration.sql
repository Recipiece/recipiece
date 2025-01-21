/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "users" ADD COLUMN     "username" TEXT NOT NULL;

alter table users
  add column username text
;

update
  users
set
  username = substr(md5(random()::text), 1, 8)
where
  true
;

alter table users
  alter column username set not null
;

-- -- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
