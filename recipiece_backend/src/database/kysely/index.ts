import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type BackgroundJob = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    finished_at: Timestamp | null;
    result: Generated<string>;
    purpose: string;
    args: unknown | null;
    user_id: number;
};
export type Cookbook = {
    id: Generated<number>;
    user_id: number;
    name: string;
    description: string | null;
    private: Generated<boolean>;
    created_at: Generated<Timestamp>;
};
export type KnownIngredient = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    ingredient_name: string;
    grams: number;
    us_cups: number;
    unitless_amount: number | null;
    preferred_measure: string | null;
};
export type MealPlan = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    name: string;
    user_id: number;
};
export type MealPlanItem = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    meal_plan_id: number;
    start_date: Timestamp;
    freeform_content: string | null;
    notes: string | null;
    recipe_id: number | null;
    label: string | null;
};
export type Recipe = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    name: string;
    description: string | null;
    duration_ms: number | null;
    servings: number | null;
    private: Generated<boolean>;
    metadata: unknown | null;
    user_id: number;
};
export type RecipeCookbookAttachment = {
    recipe_id: number;
    cookbook_id: number;
};
export type RecipeIngredient = {
    id: Generated<number>;
    name: string;
    unit: string | null;
    amount: string | null;
    order: number;
    recipe_id: number;
};
export type RecipeStep = {
    id: Generated<number>;
    content: string;
    order: number;
    duration_ms: number | null;
    recipe_id: number;
};
export type ScheduledNotification = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    to_be_run_at: Timestamp;
    purpose: string;
    args: unknown | null;
    recipe_id: number;
};
export type ShoppingList = {
    id: Generated<number>;
    name: string;
    created_at: Generated<Timestamp>;
    user_id: number;
};
export type ShoppingListItem = {
    id: Generated<number>;
    shopping_list_id: number;
    completed: Generated<boolean>;
    order: number;
    content: string;
    notes: string | null;
};
export type Timer = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    duration_ms: number;
    user_id: number;
};
export type User = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    email: string;
    validated: Generated<boolean>;
    username: string;
};
export type UserAccessRecord = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    access_levels: string[];
    start_date: Timestamp;
    end_date: Timestamp | null;
    user_id: number;
};
export type UserCredentials = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    password_hash: string;
    user_id: number;
};
export type UserPushNotificationSubscription = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    subscription_data: unknown;
    device_id: string;
    user_id: number;
};
export type UserSession = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    scope: string;
    user_id: number;
};
export type UserValidationToken = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    purpose: string;
    user_id: number;
};
export type DB = {
    background_jobs: BackgroundJob;
    cookbooks: Cookbook;
    known_ingredients: KnownIngredient;
    meal_plan_items: MealPlanItem;
    meal_plans: MealPlan;
    recipe_cookbook_attachments: RecipeCookbookAttachment;
    recipe_ingredients: RecipeIngredient;
    recipe_steps: RecipeStep;
    recipes: Recipe;
    scheduled_notifications: ScheduledNotification;
    shopping_list_items: ShoppingListItem;
    shopping_lists: ShoppingList;
    timers: Timer;
    user_access_records: UserAccessRecord;
    user_credentials: UserCredentials;
    user_push_notification_subscriptions: UserPushNotificationSubscription;
    user_sessions: UserSession;
    user_validation_tokens: UserValidationToken;
    users: User;
};
