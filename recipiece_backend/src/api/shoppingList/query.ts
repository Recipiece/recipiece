import {
  KyselyCore,
  KyselyGenerated,
  prisma,
  PrismaTransaction,
  ShoppingListItem,
  ShoppingListShare,
  User,
} from "@recipiece/database";

/**
 * Takes all the items in the provided shopping list and aligns their order so that there's no out-of-order entities
 *
 * @param shoppingListId the id of the shopping list
 * @param tx an optional transaction object, if we're running the collapse in a transaction
 * @returns the shopping list items that were affected, which should be all shopping list items belonging to the shopping list
 */
export const collapseOrders = async (shoppingListId: number, tx?: any): Promise<ShoppingListItem[]> => {
  return (await (tx ?? prisma).$queryRaw`
    with updated as (
      update
        shopping_list_items
      set
        "order" = ord_sq.order_in_row
      from
        (
          select
            id,
            row_number () over (
              partition by completed
              order by "order"
            ) as order_in_row
          from
            shopping_list_items
          where
            shopping_list_items.shopping_list_id = ${shoppingListId}
        ) as ord_sq
      where
        ord_sq.id = shopping_list_items.id
      returning
        shopping_list_items.*
    )
    select * from updated
    order by
      completed asc,
      "order" asc
    ;
  `) as unknown as ShoppingListItem[];
};

export const getShoppingListByIdQuery = (tx: PrismaTransaction, user: User, shoppingListId: number) => {
  const allShareCheck = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "shopping_lists">) => {
    return eb.exists(
      eb
        .selectFrom("user_kitchen_memberships")
        .where((_eb) => {
          return _eb.and([
            _eb("user_kitchen_memberships.destination_user_id", "=", user.id),
            _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
          ]);
        })
        .whereRef("user_kitchen_memberships.source_user_id", "=", "shopping_lists.user_id")
        .where("shopping_lists.id", "=", shoppingListId)
        .limit(1)
    );
  };

  const query = tx.$kysely
    .selectFrom("shopping_lists")
    .selectAll("shopping_lists")
    .select((eb) => {
      return eb
        .case()
        .when("shopping_lists.user_id", "=", user.id)
        .then(shoppingListSharesSubquery(eb, user.id))
        .when(allShareCheck(eb))
        .then(
          eb.fn("jsonb_build_array", [
            eb.fn("jsonb_build_object", [
              KyselyCore.sql.lit("id"),
              eb.lit(-1),
              KyselyCore.sql.lit("created_at"),
              eb.fn("now"),
              KyselyCore.sql.lit("shopping_list_id"),
              "shopping_lists.id",
              KyselyCore.sql.lit("user_kitchen_membership_id"),
              eb
                .selectFrom("user_kitchen_memberships")
                .select("user_kitchen_memberships.id")
                .whereRef("user_kitchen_memberships.source_user_id", "=", "shopping_lists.user_id")
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
        eb("shopping_lists.id", "=", shoppingListId),
        eb.or([
          // it's your meal_plan
          eb("shopping_lists.user_id", "=", user.id),
          // it's implicitly shared through an ALL grant type
          allShareCheck(eb),
        ]),
      ]);
    });

  return query;
};

export const shoppingListSharesWithMemberships = (
  eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "shopping_lists">,
  userId: number
) => {
  return eb
    .selectFrom("shopping_list_shares")
    .innerJoin(
      "user_kitchen_memberships",
      "user_kitchen_memberships.id",
      "shopping_list_shares.user_kitchen_membership_id"
    )
    .whereRef("shopping_list_shares.shopping_list_id", "=", "shopping_lists.id")
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

export const shoppingListSharesSubquery = (
  eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "shopping_lists">,
  userId: number
) => {
  return shoppingListSharesWithMemberships(eb, userId).select(
    KyselyCore.sql<ShoppingListShare[]>`
      coalesce(
        jsonb_agg(shopping_list_shares.*),
        '[]'
      )
      `.as("shares_aggregate")
  );
};

export const shoppingListItemsSubquery = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "shopping_lists">) => {
  return eb
    .selectFrom("shopping_list_items")
    .whereRef("shopping_list_items.shopping_list_id", "=", "shopping_lists.id")
    .select(
      KyselyCore.sql<ShoppingListItem[]>`
      coalesce(
        jsonb_agg(shopping_list_items.* order by shopping_list_items."order" asc),
        '[]'
      )  
      `.as("items_aggregate")
    );
};
