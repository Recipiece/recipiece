import { KyselyCore, KyselyGenerated, PrismaTransaction, User } from "@recipiece/database";

export const getCookbookByIdQuery = (tx: PrismaTransaction, user: User, cookbookId: number) => {
  const allShareCheck = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "cookbooks">) => {
    return eb.exists(
      eb
        .selectFrom("user_kitchen_memberships")
        .where((_eb) => {
          return _eb.or([
            _eb.and([_eb("user_kitchen_memberships.destination_user_id", "=", user.id), _eb("user_kitchen_memberships.source_user_id", "=", _eb.ref("cookbooks.user_id"))]),
            _eb.and([_eb("user_kitchen_memberships.source_user_id", "=", user.id), _eb("user_kitchen_memberships.destination_user_id", "=", _eb.ref("cookbooks.user_id"))]),
          ]);
        })
        .where((_eb) => {
          return _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
        })
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
        .when(allShareCheck(eb))
        .then(
          eb
            .selectFrom("user_kitchen_memberships")
            .select("user_kitchen_memberships.id")
            .where((_eb) => {
              return _eb.or([
                _eb.and([_eb("user_kitchen_memberships.destination_user_id", "=", user.id), _eb("user_kitchen_memberships.source_user_id", "=", _eb.ref("cookbooks.user_id"))]),
                _eb.and([_eb("user_kitchen_memberships.source_user_id", "=", user.id), _eb("user_kitchen_memberships.destination_user_id", "=", _eb.ref("cookbooks.user_id"))]),
              ]);
            })
            .where((_eb) => {
              return _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
            })
            .limit(1)
        )
        .else(() => eb.lit(-1))
        .end()
        .as("user_kitchen_membership");
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
