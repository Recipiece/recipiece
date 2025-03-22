-- CreateEnum
CREATE TYPE "UserKitchenMembershipGrantLevel" AS ENUM ('ALL', 'SELECTIVE');

-- AlterTable
ALTER TABLE "user_kitchen_memberships" ADD COLUMN     "grant_level" "UserKitchenMembershipGrantLevel";

update 
    user_kitchen_memberships
set 
    grant_level = 'ALL' 
where 
    true
;

alter table user_kitchen_memberships
    alter column "grant_level" set not null
;
