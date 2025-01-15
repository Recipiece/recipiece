-- AlterTable
ALTER TABLE "users" ADD COLUMN     "preferences" JSONB NOT NULL DEFAULT '{}';

update users
set preferences = E'{
    "account_visibility": "protected"
}'
where true
;
