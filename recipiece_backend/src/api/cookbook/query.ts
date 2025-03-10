import { KyselyCore, KyselyGenerated, PrismaTransaction, User } from "@recipiece/database";

export const cookbookSharesWithMemberships = (
  eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "cookbooks">,
  userId: number
) => {
  return eb
    .selectFrom("cookbook_shares")
    .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "cookbook_shares.user_kitchen_membership_id")
    .whereRef("cookbook_shares.cookbook_id", "=", "cookbooks.id")
    .where((eb) => {
      return eb.and([
        eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
        eb.or([
          eb("user_kitchen_memberships.destination_user_id", "=", userId),
          eb("user_kitchen_memberships.source_user_id", "=", userId),
        ]),
      ]);
    });
};

export const cookbookSharesSubquery = (
  eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "cookbooks">,
  userId: number
) => {
  return cookbookSharesWithMemberships(eb, userId).select(
    KyselyCore.sql<KyselyGenerated.CookbookShare[]>`
      coalesce(
        jsonb_agg(cookbook_shares.*),
        '[]'
      )
      `.as("shares_aggregate")
  );
};

export const getCookbookByIdQuery = (tx: PrismaTransaction, user: User, cookbookId: number) => {
  const allShareCheck = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "cookbooks">) => {
    return eb.exists(
      eb
        .selectFrom("user_kitchen_memberships")
        .where((_eb) => {
          return _eb.and([
            _eb("user_kitchen_memberships.destination_user_id", "=", user.id),
            _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
          ]);
        })
        .whereRef("user_kitchen_memberships.source_user_id", "=", "cookbooks.user_id")
        .where("cookbooks.id", "=", cookbookId)
        .limit(1)
    );
  };

  const query = tx.$kysely
    .selectFrom("cookbooks")
    .selectAll("cookbooks")
    .select((eb) => {
      return eb
        .case()
        .when("cookbooks.user_id", "=", user.id)
        .then(cookbookSharesSubquery(eb, user.id))
        .when(allShareCheck(eb))
        .then(
          eb.fn("jsonb_build_array", [
            eb.fn("jsonb_build_object", [
              KyselyCore.sql.lit("id"),
              eb.lit(-1),
              KyselyCore.sql.lit("created_at"),
              eb.fn("now"),
              KyselyCore.sql.lit("cookbook_id"),
              "cookbooks.id",
              KyselyCore.sql.lit("user_kitchen_membership_id"),
              eb
                .selectFrom("user_kitchen_memberships")
                .select("user_kitchen_memberships.id")
                .whereRef("user_kitchen_memberships.source_user_id", "=", "cookbooks.user_id")
                .where((_eb) => {
                  return _eb.and([
                    _eb("user_kitchen_memberships.destination_user_id", "=", user.id),
                    _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
                  ]);
                })
                .limit(1),
            ]),
          ])
        )
        .else(KyselyCore.sql`'[]'::jsonb`)
        .end()
        .as("shares");
    })
    .where((eb) => {
      return eb.and([
        eb("cookbooks.id", "=", cookbookId),
        eb.or([
          // it's your cookbook
          eb("cookbooks.user_id", "=", user.id),
          // it's implicitly shared through an ALL grant type
          allShareCheck(eb),
        ]),
      ]);
    });

  return query;
};
