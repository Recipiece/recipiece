import { KyselyCore, KyselyGenerated, PrismaTransaction, Recipe, RecipeIngredient, User, UserTag } from "@recipiece/database";

export const getRecipeByIdQuery = (tx: PrismaTransaction, user: User, recipeId: number) => {
  const allShareCheck = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
    return eb.exists(
      eb
        .selectFrom("user_kitchen_memberships")
        .where((_eb) => {
          return _eb.or([
            _eb.and([_eb("user_kitchen_memberships.destination_user_id", "=", user.id), _eb("user_kitchen_memberships.source_user_id", "=", _eb.ref("recipes.user_id"))]),
            _eb.and([_eb("user_kitchen_memberships.source_user_id", "=", user.id), _eb("user_kitchen_memberships.destination_user_id", "=", _eb.ref("recipes.user_id"))]),
          ]);
        })
        .where((_eb) => {
          return _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
        })
        .where("recipes.id", "=", recipeId)
        .limit(1)
    );
  };

  const query = tx.$kysely
    .selectFrom("recipes")
    .selectAll("recipes")
    .select((eb) => {
      return [stepsSubquery(eb).as("steps"), ingredientsSubquery(eb).as("ingredients"), tagsSubquery(eb).as("tags")];
    })
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
                _eb.and([_eb("user_kitchen_memberships.destination_user_id", "=", user.id), _eb("user_kitchen_memberships.source_user_id", "=", _eb.ref("recipes.user_id"))]),
                _eb.and([_eb("user_kitchen_memberships.source_user_id", "=", user.id), _eb("user_kitchen_memberships.destination_user_id", "=", _eb.ref("recipes.user_id"))]),
              ]);
            })
            .where((_eb) => {
              return _eb(_eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted");
            })
            .limit(1)
        )
        .else(() => eb.lit(-1))
        .end()
        .as("user_kitchen_membership_id");
    })
    .where((eb) => {
      return eb.and([
        eb("recipes.id", "=", recipeId),
        eb.or([
          // it's your recipe
          eb("recipes.user_id", "=", user.id),
          // it's implicitly shared through an ALL grant type
          allShareCheck(eb),
        ]),
      ]);
    });

  return query;
};

/**
 * manage the tags for a recipe.
 *
 * this will sanitize the provided string by lowering and trimming them,
 * and then create new tags for any values which don't already have a corresponding user_tags value by content,
 * and then attach all the tags to the recipe.
 */
export const lazyAttachTags = async (recipe: Recipe, tags: string[], tx: PrismaTransaction): Promise<UserTag[]> => {
  const sanitizedTags = tags.map((t) => t.toLowerCase().trim());

  const matchingTags = await tx.$kysely
    .selectFrom("user_tags")
    .selectAll()
    .where((eb) => {
      return eb.and([eb("user_tags.user_id", "=", recipe.user_id), eb("user_tags.content", "in", sanitizedTags)]);
    })
    .execute();

  const matchingTagsContent = matchingTags.map((t) => t.content);
  const tagsToCreate = sanitizedTags.filter((tag) => !matchingTagsContent.includes(tag));

  let createdTags: UserTag[] = [];
  if (tagsToCreate.length > 0) {
    createdTags = await tx.userTag.createManyAndReturn({
      data: tagsToCreate.map((tag) => {
        return {
          user_id: recipe.user_id,
          content: tag,
        };
      }),
    });
  }

  const allTags: UserTag[] = [...matchingTags, ...createdTags];

  await tx.recipeTagAttachment.createManyAndReturn({
    data: allTags.map((tag) => {
      return {
        user_tag_id: tag.id,
        recipe_id: recipe.id,
      };
    }),
  });

  return allTags;
};

export const ingredientsSubquery = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
  return eb
    .selectFrom("recipe_ingredients")
    .whereRef("recipe_ingredients.recipe_id", "=", "recipes.id")
    .select(
      KyselyCore.sql<RecipeIngredient[]>`
      coalesce(
        jsonb_agg(recipe_ingredients.* order by recipe_ingredients."order" asc),
        '[]'
      )
      `.as("ingredient_aggregate")
    );
};

export const stepsSubquery = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
  return eb
    .selectFrom("recipe_steps")
    .select(
      KyselyCore.sql<KyselyGenerated.RecipeStep[]>`
      coalesce(
        jsonb_agg(recipe_steps.* order by recipe_steps."order" asc),
        '[]'
      )
      `.as("steps_aggregate")
    )
    .whereRef("recipe_steps.recipe_id", "=", "recipes.id");
};

export const tagsSubquery = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">) => {
  return eb
    .selectFrom("recipe_tag_attachments")
    .select(
      KyselyCore.sql<KyselyGenerated.UserTag[]>`
        coalesce(
          jsonb_agg(user_tags.* order by content),
          '[]'
        )
      `.as("tags_aggregate")
    )
    .innerJoin("user_tags", "user_tags.id", "recipe_tag_attachments.user_tag_id")
    .whereRef("recipes.id", "=", "recipe_tag_attachments.recipe_id")
    .whereRef("user_tags.user_id", "=", "recipes.user_id");
};
