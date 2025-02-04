import { InferType } from "yup";
export declare const YRecipeIngredientSchema: import("yup").ObjectSchema<{
    id: number;
    recipe_id: number;
    name: string;
    unit: import("yup").Maybe<string | undefined>;
    amount: import("yup").Maybe<string | undefined>;
    order: number;
}, import("yup").AnyObject, {
    id: undefined;
    recipe_id: undefined;
    name: undefined;
    unit: undefined;
    amount: undefined;
    order: undefined;
}, "">;
export declare const YRecipeStepSchema: import("yup").ObjectSchema<{
    id: number;
    recipe_id: number;
    order: number;
    content: string;
}, import("yup").AnyObject, {
    id: undefined;
    recipe_id: undefined;
    order: undefined;
    content: undefined;
}, "">;
export declare const YRecipeShareSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    recipe_id: number;
    user_kitchen_membership_id: number;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    recipe_id: undefined;
    user_kitchen_membership_id: undefined;
}, "">;
export declare const YRecipeSchema: import("yup").ObjectSchema<{
    id: number;
    user_id: number;
    name: string;
    created_at: Date;
    description: import("yup").Maybe<string | undefined>;
    duration_ms: import("yup").Maybe<number | undefined>;
    servings: import("yup").Maybe<number | undefined>;
    ingredients: import("yup").Maybe<{
        unit?: import("yup").Maybe<string | undefined>;
        amount?: import("yup").Maybe<string | undefined>;
        id: number;
        order: number;
        recipe_id: number;
        name: string;
    }[] | undefined>;
    steps: import("yup").Maybe<{
        id: number;
        order: number;
        recipe_id: number;
        content: string;
    }[] | undefined>;
    shares: import("yup").Maybe<{
        id: number;
        created_at: Date;
        recipe_id: number;
        user_kitchen_membership_id: number;
    }[] | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    user_id: undefined;
    name: undefined;
    created_at: undefined;
    description: undefined;
    duration_ms: undefined;
    servings: undefined;
    ingredients: "";
    steps: "";
    shares: "";
}, "">;
export interface RecipeSchema extends InferType<typeof YRecipeSchema> {
}
export interface RecipeIngredientSchema extends InferType<typeof YRecipeIngredientSchema> {
}
export interface RecipeStepSchema extends InferType<typeof YRecipeStepSchema> {
}
export interface RecipeShareSchema extends InferType<typeof YRecipeShareSchema> {
}
/**
 * Create recipe schema
 */
export declare const YCreateRecipeRequestSchema: import("yup").ObjectSchema<{
    name: string;
    description: import("yup").Maybe<string | undefined>;
    servings: import("yup").Maybe<number | undefined>;
    ingredients: import("yup").Maybe<{
        unit?: import("yup").Maybe<string | undefined>;
        amount?: import("yup").Maybe<string | undefined>;
        order: number;
        name: string;
    }[] | undefined>;
    steps: import("yup").Maybe<{
        order: number;
        content: string;
    }[] | undefined>;
}, import("yup").AnyObject, {
    name: undefined;
    description: undefined;
    servings: undefined;
    ingredients: "";
    steps: "";
}, "">;
export interface CreateRecipeRequestSchema extends InferType<typeof YCreateRecipeRequestSchema> {
}
/**
 * Parse recipe schema
 */
export declare const YParseRecipeFromURLRequestSchema: import("yup").ObjectSchema<{
    source_url: string;
}, import("yup").AnyObject, {
    source_url: undefined;
}, "">;
export interface ParseRecipeFromURLRequestSchema extends InferType<typeof YParseRecipeFromURLRequestSchema> {
}
export interface ParsedFromURLRecipe {
    readonly author?: string;
    readonly description?: string;
    readonly parsed_ingredients?: {
        readonly name: string;
        readonly amount?: string;
        readonly unit?: string;
    }[];
    readonly title?: string;
    readonly instructions_list?: string[];
}
/**
 * Update recipe schema
 */
export declare const YUpdateRecipeRequestSchema: import("yup").ObjectSchema<{
    id: number;
    name: import("yup").Maybe<string | undefined>;
    description: import("yup").Maybe<string | undefined>;
    servings: import("yup").Maybe<number | undefined>;
    ingredients: import("yup").Maybe<{
        unit?: import("yup").Maybe<string | undefined>;
        amount?: import("yup").Maybe<string | undefined>;
        order: number;
        name: string;
    }[] | undefined>;
    steps: import("yup").Maybe<{
        order: number;
        content: string;
    }[] | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    name: undefined;
    description: undefined;
    servings: undefined;
    ingredients: "";
    steps: "";
}, "">;
export interface UpdateRecipeRequestSchema extends InferType<typeof YUpdateRecipeRequestSchema> {
}
/**
 * List recipes schema
 */
export declare const YListRecipesQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    search: import("yup").Maybe<string | undefined>;
    cookbook_id: import("yup").Maybe<number | undefined>;
    cookbook_attachments: import("yup").Maybe<"include" | "exclude" | undefined>;
    shared_recipes: import("yup").Maybe<"include" | "exclude" | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    search: undefined;
    cookbook_id: undefined;
    cookbook_attachments: undefined;
    shared_recipes: undefined;
}, "">;
export interface ListRecipesQuerySchema extends InferType<typeof YListRecipesQuerySchema> {
}
export declare const YListRecipesResponseSchema: import("yup").ObjectSchema<{
    data: {
        description?: import("yup").Maybe<string | undefined>;
        duration_ms?: import("yup").Maybe<number | undefined>;
        servings?: import("yup").Maybe<number | undefined>;
        ingredients?: import("yup").Maybe<{
            unit?: import("yup").Maybe<string | undefined>;
            amount?: import("yup").Maybe<string | undefined>;
            id: number;
            order: number;
            recipe_id: number;
            name: string;
        }[] | undefined>;
        steps?: import("yup").Maybe<{
            id: number;
            order: number;
            recipe_id: number;
            content: string;
        }[] | undefined>;
        shares?: import("yup").Maybe<{
            id: number;
            created_at: Date;
            recipe_id: number;
            user_kitchen_membership_id: number;
        }[] | undefined>;
        id: number;
        created_at: Date;
        name: string;
        user_id: number;
    }[];
    has_next_page: NonNullable<boolean | undefined>;
    page: number;
}, import("yup").AnyObject, {
    data: undefined;
    has_next_page: undefined;
    page: undefined;
}, "">;
export interface ListRecipesResponseSchema extends InferType<typeof YListRecipesResponseSchema> {
}
/**
 * Fork Recipes Schema
 */
export declare const YForkRecipeRequestSchema: import("yup").ObjectSchema<{
    original_recipe_id: number;
}, import("yup").AnyObject, {
    original_recipe_id: undefined;
}, "">;
export interface ForkRecipeRequestSchema extends InferType<typeof YForkRecipeRequestSchema> {
}
/**
 * Create Recipe Share
 */
export declare const YCreateRecipeShareRequestSchema: import("yup").ObjectSchema<{
    user_kitchen_membership_id: number;
    recipe_id: number;
}, import("yup").AnyObject, {
    user_kitchen_membership_id: undefined;
    recipe_id: undefined;
}, "">;
export interface CreateRecipeShareRequestSchema extends InferType<typeof YCreateRecipeShareRequestSchema> {
}
/**
 * List Recipe Shares
 */
export declare const YListRecipeSharesQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    targeting_self: import("yup").Maybe<boolean | undefined>;
    from_self: import("yup").Maybe<boolean | undefined>;
    user_kitchen_membership_id: import("yup").Maybe<number | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    targeting_self: undefined;
    from_self: undefined;
    user_kitchen_membership_id: undefined;
}, "">;
export interface ListRecipeSharesQuerySchema extends InferType<typeof YListRecipeSharesQuerySchema> {
}
export declare const YListRecipeSharesResponseSchema: import("yup").ObjectSchema<{
    data: {
        id: number;
        created_at: Date;
        recipe_id: number;
        user_kitchen_membership_id: number;
        recipe: {
            id: number;
            name: string;
        };
        user_kitchen_membership: {
            id: number;
            created_at: Date;
            destination_user: {
                id: number;
                username: string;
            };
            source_user: {
                id: number;
                username: string;
            };
            status: NonNullable<"accepted" | "denied" | "pending" | undefined>;
        };
    }[];
    has_next_page: NonNullable<boolean | undefined>;
    page: number;
}, import("yup").AnyObject, {
    data: undefined;
    has_next_page: undefined;
    page: undefined;
}, "">;
export interface ListRecipeSharesResponseSchema extends InferType<typeof YListRecipeSharesResponseSchema> {
}
//# sourceMappingURL=recipe.d.ts.map