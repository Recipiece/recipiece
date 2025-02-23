# Recipiece Database
The holy database.
Contains database logic for both the Redis and Postgres databases.

## Prisma
Recipiece currently uses Prisma for postgres connections.

Postgres schemas and migrations can be found in the `prisma` folder.

Projects that utilize this library must include the appropriate database binary in their bundle to function properly.


## SQL
The `sql` folder contains some junk sql scripts. 
None of those are intended to production (or really even development) use.