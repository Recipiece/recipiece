import { Constant } from "@recipiece/constant";
import { KyselyCore, KyselyGenerated, PrismaTransaction } from "@recipiece/database";
import { ListRecipesQuerySchema, ListRecipesResponseSchema, YRecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { ingredientsSubquery, stepsSubquery, tagsSubquery } from "./query";

export const listRecipes = async (
  request: AuthenticatedRequest<any, ListRecipesQuerySchema>,
  tx: PrismaTransaction
): ApiResponse<ListRecipesResponseSchema> => {
  const {
    page_number,
    page_size,
    user_kitchen_membership_ids,
    search,
    cookbook_id,
    cookbook_attachments_filter,
    ingredients,
    tags,
    ingredients_filter,
    tags_filter,
  } = request.query;
  const actualPageSize = page_size ?? Constant.DEFAULT_PAGE_SIZE;
  const user = request.user;

  const membershipIds = (user_kitchen_membership_ids ?? [])
    .filter(
      (val) => val !== Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL && val !== Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER
    )
    .map((val) => +val!);
  const showUserRecipes =
    user_kitchen_membership_ids &&
    !!user_kitchen_membership_ids.find((id) => id === Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER);
  const showAllRecipes =
    user_kitchen_membership_ids &&
    !!user_kitchen_membership_ids.find((id) => id === Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL);

  const selectableSubqueries = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
    return [ingredientsSubquery(eb).as("ingredients"), stepsSubquery(eb).as("steps"), tagsSubquery(eb).as("tags")];
  };

  let query = tx.$kysely
    .with("owned_recipes", (db) => {
      return db
        .selectFrom("recipes")
        .selectAll("recipes")
        .select(selectableSubqueries)
        .select((eb) => {
          return eb.lit(-1).as("user_kitchen_membership_id");
        })
        .where("recipes.user_id", "=", user.id);
    })
    .with("shared_recipes", (db) => {
      let base = db
        .selectFrom("user_kitchen_memberships")
        .innerJoin("users", "users.id", "user_kitchen_memberships.source_user_id")
        .innerJoin("recipes", "recipes.user_id", "user_id")
        .where((eb) => {
          return eb.or([
            eb.and([
              eb("user_kitchen_memberships.destination_user_id", "=", user.id),
              eb("user_kitchen_memberships.source_user_id", "=", eb.ref("recipes.user_id")),
            ]),
            eb.and([
              eb("user_kitchen_memberships.source_user_id", "=", user.id),
              eb("user_kitchen_memberships.destination_user_id", "=", eb.ref("recipes.user_id")),
            ]),
          ]);
        })
        .where((eb) => {
          return eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
        })
        .selectAll("recipes")
        .select(selectableSubqueries)
        .select("user_kitchen_memberships.id as user_kitchen_membership_id")
      if (membershipIds.length > 0) {
        base = base.where("user_kitchen_memberships.id", "in", membershipIds);
      }

      return base;
    })
    .with("all_recipes", (db) => {
      if (showAllRecipes || (showUserRecipes && membershipIds.length > 0)) {
        return db
          .selectFrom("owned_recipes")
          .union((eb) => {
            return eb.selectFrom("shared_recipes").selectAll();
          })
          .selectAll();
      } else if (!showUserRecipes && membershipIds.length > 0) {
        return db.selectFrom("shared_recipes").selectAll();
      } else if (showUserRecipes && membershipIds.length === 0) {
        return db.selectFrom("owned_recipes").selectAll();
      } else {
        throw new Error("Invalid filter state!");
      }
    })
    .selectFrom("all_recipes")
    .selectAll("all_recipes");

  if (ingredients) {
    if (ingredients_filter === "include") {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(ingredients.join("|"));
        return KyselyCore.sql`lower(all_recipes.ingredients::text) ~* '"name": "(${joined})"'`;
      });
    } else {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(ingredients.join("|"));
        return KyselyCore.sql`lower(all_recipes.ingredients::text) !~* '"name": "(${joined})"'`;
      });
    }
  }

  if (tags) {
    if (tags_filter === "include") {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(tags.join("|"));
        return KyselyCore.sql`lower(all_recipes.tags::text) ~* '"content": "(${joined})"'`;
      });
    } else {
      query = query.where(() => {
        const joined = KyselyCore.sql.raw(tags.join("|"));
        return KyselyCore.sql`lower(all_recipes.tags::text) !~* '"content": "(${joined})"'`;
      });
    }
  }

  if (search) {
    query = query.where("all_recipes.name", "ilike", `%${search}%`);
  }

  if (cookbook_id && cookbook_attachments_filter === "include") {
    query = query.where((eb) => {
      return eb(
        "all_recipes.id",
        "in",
        eb
          .selectFrom("recipe_cookbook_attachments")
          .select("recipe_cookbook_attachments.recipe_id")
          .where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id)
      );
    });
  } else if (cookbook_id && cookbook_attachments_filter === "exclude") {
    query = query.where((eb) => {
      return eb(
        "all_recipes.id",
        "not in",
        eb
          .selectFrom("recipe_cookbook_attachments")
          .select("recipe_cookbook_attachments.recipe_id")
          .where("recipe_cookbook_attachments.cookbook_id", "=", cookbook_id)
      );
    });
  }

  query = query.orderBy("all_recipes.name asc");
  query = query.offset(page_number * actualPageSize).limit(actualPageSize + 1);

  const recipes = await query.execute();

  const hasNextPage = recipes.length > actualPageSize;
  const resultsData = recipes.splice(0, actualPageSize).map((val) => YRecipeSchema.cast(val));

  return [
    StatusCodes.OK,
    {
      data: resultsData,
      has_next_page: hasNextPage,
      page: page_number,
    },
  ];
};
