import { KyselyCore, KyselyGenerated, PrismaTransaction, Recipe, RecipeIngredient, UserTag } from "@recipiece/database";

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

export const recipeSharesWithMemberships = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">, userId: number) => {
  return eb
    .selectFrom("recipe_shares")
    .innerJoin("user_kitchen_memberships", "user_kitchen_memberships.id", "recipe_shares.user_kitchen_membership_id")
    .whereRef("recipe_shares.recipe_id", "=", "recipes.id")
    .where((eb) => {
      return eb.and([
        eb(eb.cast("user_kitchen_memberships.status", "text"), "=", "accepted"),
        eb.or([eb("user_kitchen_memberships.destination_user_id", "=", userId), eb("user_kitchen_memberships.source_user_id", "=", userId)]),
      ]);
    });
};

export const recipeSharesSubquery = (eb: KyselyCore.ExpressionBuilder<KyselyGenerated.DB, "recipes">, userId: number) => {
  return recipeSharesWithMemberships(eb, userId).select(
    KyselyCore.sql<KyselyGenerated.RecipeShare[]>`
      coalesce(
        jsonb_agg(recipe_shares.*),
        '[]'
      )
      `.as("shares_aggregate")
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
