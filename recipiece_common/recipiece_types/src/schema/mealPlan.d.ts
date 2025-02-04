import { InferType } from "yup";
export declare const YMealPlanShareSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    meal_plan_id: number;
    user_kitchen_membership_id: number;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    meal_plan_id: undefined;
    user_kitchen_membership_id: undefined;
}, "">;
export declare const YMealPlanItemSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    meal_plan_id: number;
    start_date: Date;
    freeform_content: import("yup").Maybe<string | undefined>;
    notes: import("yup").Maybe<string | undefined>;
    recipe_id: import("yup").Maybe<number | undefined>;
    recipe: {
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
    } | null | undefined;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    meal_plan_id: undefined;
    start_date: undefined;
    freeform_content: undefined;
    notes: undefined;
    recipe_id: undefined;
    recipe: {
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
    };
}, "">;
export declare const YMealPlanConfigurationSchema: import("yup").ObjectSchema<{
    generation: {
        excluded_ingredients?: import("yup").Maybe<(string | undefined)[] | undefined>;
    } | null | undefined;
    general: {
        treat_times_as?: import("yup").Maybe<"begin_at" | "finish_at" | undefined>;
        send_recipe_notification?: import("yup").Maybe<boolean | undefined>;
    } | null | undefined;
    meats: {
        preferred_thawing_method?: import("yup").Maybe<"refrigerator" | "cold_water" | "microwave" | undefined>;
        send_thawing_notification?: import("yup").Maybe<boolean | undefined>;
    } | null | undefined;
}, import("yup").AnyObject, {
    generation: {
        excluded_ingredients: undefined;
    };
    general: {
        treat_times_as: undefined;
        send_recipe_notification: undefined;
    };
    meats: {
        preferred_thawing_method: undefined;
        send_thawing_notification: undefined;
    };
}, "">;
export interface MealPlanShareSchema extends InferType<typeof YMealPlanShareSchema> {
}
export interface MealPlanConfigurationSchema extends InferType<typeof YMealPlanConfigurationSchema> {
}
export interface MealPlanItemSchema extends InferType<typeof YMealPlanItemSchema> {
}
export declare const YMealPlanSchema: import("yup").ObjectSchema<{
    id: number;
    name: string;
    user_id: number;
    created_at: Date;
    configuration: {
        generation?: {
            excluded_ingredients?: import("yup").Maybe<(string | undefined)[] | undefined>;
        } | null | undefined;
        general?: {
            treat_times_as?: import("yup").Maybe<"begin_at" | "finish_at" | undefined>;
            send_recipe_notification?: import("yup").Maybe<boolean | undefined>;
        } | null | undefined;
        meats?: {
            preferred_thawing_method?: import("yup").Maybe<"refrigerator" | "cold_water" | "microwave" | undefined>;
            send_thawing_notification?: import("yup").Maybe<boolean | undefined>;
        } | null | undefined;
    } | null | undefined;
    shares: import("yup").Maybe<{
        id: number;
        created_at: Date;
        meal_plan_id: number;
        user_kitchen_membership_id: number;
    }[] | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    name: undefined;
    user_id: undefined;
    created_at: undefined;
    configuration: {
        generation: {
            excluded_ingredients: undefined;
        };
        general: {
            treat_times_as: undefined;
            send_recipe_notification: undefined;
        };
        meats: {
            preferred_thawing_method: undefined;
            send_thawing_notification: undefined;
        };
    };
    shares: undefined;
}, "">;
export interface MealPlanSchema extends InferType<typeof YMealPlanSchema> {
}
/**
 * Create meal plan
 */
export declare const YCreateMealPlanRequestSchema: import("yup").ObjectSchema<{
    name: string;
}, import("yup").AnyObject, {
    name: undefined;
}, "">;
export interface CreateMealPlanRequestSchema extends InferType<typeof YCreateMealPlanRequestSchema> {
}
/**
 * Update meal plan
 */
export declare const YUpdateMealPlanRequestSchema: import("yup").ObjectSchema<{
    id: number;
    name: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    name: undefined;
}, "">;
export interface UpdateMealPlanRequestSchema extends InferType<typeof YUpdateMealPlanRequestSchema> {
}
/**
 * List meal plans
 */
export declare const YListMealPlansQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    shared_meal_plans: import("yup").Maybe<"include" | "exclude" | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    shared_meal_plans: undefined;
}, "">;
export interface ListMealPlansQuerySchema extends InferType<typeof YListMealPlansQuerySchema> {
}
export declare const YListMealPlansResponseSchema: import("yup").ObjectSchema<{
    data: {
        shares?: import("yup").Maybe<{
            id: number;
            created_at: Date;
            meal_plan_id: number;
            user_kitchen_membership_id: number;
        }[] | undefined>;
        configuration?: {
            generation?: {
                excluded_ingredients?: import("yup").Maybe<(string | undefined)[] | undefined>;
            } | null | undefined;
            general?: {
                treat_times_as?: import("yup").Maybe<"begin_at" | "finish_at" | undefined>;
                send_recipe_notification?: import("yup").Maybe<boolean | undefined>;
            } | null | undefined;
            meats?: {
                preferred_thawing_method?: import("yup").Maybe<"refrigerator" | "cold_water" | "microwave" | undefined>;
                send_thawing_notification?: import("yup").Maybe<boolean | undefined>;
            } | null | undefined;
        } | null | undefined;
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
export interface ListMealPlansResponseSchema extends InferType<typeof YListMealPlansResponseSchema> {
}
/**
 * List items for meal plan
 */
export declare const YListItemsForMealPlanQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    start_date: import("yup").Maybe<string | undefined>;
    end_date: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    start_date: undefined;
    end_date: undefined;
}, "">;
export interface ListItemsForMealPlanQuerySchema extends InferType<typeof YListItemsForMealPlanQuerySchema> {
}
export declare const YListItemsForMealPlanResponseSchema: import("yup").ObjectSchema<{
    data: {
        recipe_id?: import("yup").Maybe<number | undefined>;
        freeform_content?: import("yup").Maybe<string | undefined>;
        notes?: import("yup").Maybe<string | undefined>;
        recipe?: {
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
        } | null | undefined;
        id: number;
        created_at: Date;
        meal_plan_id: number;
        start_date: Date;
    }[];
    has_next_page: NonNullable<boolean | undefined>;
    page: number;
}, import("yup").AnyObject, {
    data: undefined;
    has_next_page: undefined;
    page: undefined;
}, "">;
export interface ListItemsForMealPlanResponseSchema extends InferType<typeof YListItemsForMealPlanResponseSchema> {
}
/**
 * Create meal plan item
 */
export declare const YCreateMealPlanItemRequestSchema: import("yup").ObjectSchema<{
    meal_plan_id: number;
    start_date: string;
    freeform_content: import("yup").Maybe<string | undefined>;
    notes: import("yup").Maybe<string | undefined>;
    recipe_id: import("yup").Maybe<number | undefined>;
}, import("yup").AnyObject, {
    meal_plan_id: undefined;
    start_date: undefined;
    freeform_content: undefined;
    notes: undefined;
    recipe_id: undefined;
}, "">;
export interface CreateMealPlanItemRequestSchema extends InferType<typeof YCreateMealPlanItemRequestSchema> {
}
/**
 * Update meal plan item
 */
export declare const YUpdateMealPlanItemRequestSchema: import("yup").ObjectSchema<{
    id: number;
    meal_plan_id: number;
    start_date: import("yup").Maybe<string | undefined>;
    freeform_content: import("yup").Maybe<string | undefined>;
    notes: import("yup").Maybe<string | undefined>;
    recipe_id: import("yup").Maybe<number | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    meal_plan_id: undefined;
    start_date: undefined;
    freeform_content: undefined;
    notes: undefined;
    recipe_id: undefined;
}, "">;
export interface UpdateMealPlanItemRequestSchema extends InferType<typeof YUpdateMealPlanItemRequestSchema> {
}
/**
 * Meal Plan Configuration
 */
/**
 * Bulk set items
 */
export declare const YBulkSetMealPlanItemsRequestSchema: import("yup").ObjectSchema<{
    create: {
        recipe_id?: import("yup").Maybe<number | undefined>;
        freeform_content?: import("yup").Maybe<string | undefined>;
        notes?: import("yup").Maybe<string | undefined>;
        meal_plan_id: number;
        start_date: Date;
    }[];
    update: {
        recipe_id?: import("yup").Maybe<number | undefined>;
        freeform_content?: import("yup").Maybe<string | undefined>;
        notes?: import("yup").Maybe<string | undefined>;
        id: number;
        created_at: Date;
        meal_plan_id: number;
        start_date: Date;
    }[];
    delete: {
        recipe_id?: import("yup").Maybe<number | undefined>;
        freeform_content?: import("yup").Maybe<string | undefined>;
        notes?: import("yup").Maybe<string | undefined>;
        id: number;
        created_at: Date;
        meal_plan_id: number;
        start_date: Date;
    }[];
}, import("yup").AnyObject, {
    create: undefined;
    update: undefined;
    delete: undefined;
}, "">;
export interface BulkSetMealPlanItemsRequestSchema extends InferType<typeof YBulkSetMealPlanItemsRequestSchema> {
}
export declare const YBulkSetMealPlanItemsResponseSchema: import("yup").ObjectSchema<{
    created: {
        recipe_id?: import("yup").Maybe<number | undefined>;
        freeform_content?: import("yup").Maybe<string | undefined>;
        notes?: import("yup").Maybe<string | undefined>;
        recipe?: {
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
        } | null | undefined;
        id: number;
        created_at: Date;
        meal_plan_id: number;
        start_date: Date;
    }[];
    updated: {
        recipe_id?: import("yup").Maybe<number | undefined>;
        freeform_content?: import("yup").Maybe<string | undefined>;
        notes?: import("yup").Maybe<string | undefined>;
        recipe?: {
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
        } | null | undefined;
        id: number;
        created_at: Date;
        meal_plan_id: number;
        start_date: Date;
    }[];
}, import("yup").AnyObject, {
    created: undefined;
    updated: undefined;
}, "">;
export interface BulkSetMealPlanItemsResponseSchema extends InferType<typeof YBulkSetMealPlanItemsResponseSchema> {
}
/**
 * Create Meal Plan Share
 */
export declare const YCreateMealPlanShareRequestSchema: import("yup").ObjectSchema<{
    user_kitchen_membership_id: number;
    meal_plan_id: number;
}, import("yup").AnyObject, {
    user_kitchen_membership_id: undefined;
    meal_plan_id: undefined;
}, "">;
export interface CreateMealPlanShareRequestSchema extends InferType<typeof YCreateMealPlanShareRequestSchema> {
}
/**
 * List MealPlan Shares
 */
export declare const YListMealPlanSharesQuerySchema: import("yup").ObjectSchema<{
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
export interface ListMealPlanSharesQuerySchema extends InferType<typeof YListMealPlanSharesQuerySchema> {
}
export declare const YListMealPlanSharesResponseSchema: import("yup").ObjectSchema<{
    data: {
        id: number;
        created_at: Date;
        meal_plan_id: number;
        user_kitchen_membership_id: number;
        meal_plan: {
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
export interface ListMealPlanSharesResponseSchema extends InferType<typeof YListMealPlanSharesResponseSchema> {
}
//# sourceMappingURL=mealPlan.d.ts.map