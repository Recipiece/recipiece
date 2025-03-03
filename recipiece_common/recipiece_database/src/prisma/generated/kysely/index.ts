import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const UserKitchenMembershipStatus = {
    accepted: "accepted",
    denied: "denied",
    pending: "pending"
} as const;
export type UserKitchenMembershipStatus = (typeof UserKitchenMembershipStatus)[keyof typeof UserKitchenMembershipStatus];
export const UserKitchenMembershipGrantLevel = {
    ALL: "ALL",
    SELECTIVE: "SELECTIVE"
} as const;
export type UserKitchenMembershipGrantLevel = (typeof UserKitchenMembershipGrantLevel)[keyof typeof UserKitchenMembershipGrantLevel];
export const NotificationStatus = {
    read: "read",
    unread: "unread"
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];
export type Cookbook = {
    id: Generated<number>;
    user_id: number;
    name: string;
    description: string | null;
    created_at: Generated<Timestamp>;
};
export type CookbookShare = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    cookbook_id: number;
    user_kitchen_membership_id: number;
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
    configuration: Generated<unknown>;
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
    leftover_of_meal_plan_item_id: number | null;
};
export type MealPlanShare = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    meal_plan_id: number;
    user_kitchen_membership_id: number;
};
export type Notification = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    user_id: number;
    title: string;
    type: string;
    status: Generated<NotificationStatus>;
    content: string;
    read_at: Timestamp | null;
    read_by_user_id: number | null;
};
export type Recipe = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    name: string;
    description: string | null;
    duration_ms: number | null;
    servings: number | null;
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
export type RecipeShare = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    recipe_id: number;
    user_kitchen_membership_id: number;
};
export type RecipeStep = {
    id: Generated<number>;
    content: string;
    order: number;
    duration_ms: number | null;
    recipe_id: number;
};
export type RecipeTagAttachment = {
    recipe_id: number;
    user_tag_id: number;
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
export type ShoppingListShare = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    shopping_list_id: number;
    user_kitchen_membership_id: number;
};
export type SideJob = {
    id: string;
    created_at: Generated<Timestamp>;
    type: string;
    user_id: number;
    job_data: unknown;
};
export type User = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    validated: Generated<boolean>;
    username: string;
    email: string;
    preferences: Generated<unknown>;
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
export type UserKitchenMembership = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    grant_level: Generated<UserKitchenMembershipGrantLevel>;
    source_user_id: number;
    destination_user_id: number;
    status: UserKitchenMembershipStatus;
};
export type UserKitchenMembershipNotificationAttachment = {
    created_at: Generated<Timestamp>;
    user_kitchen_membership_id: number;
    notification_id: number;
};
export type UserPushNotificationSubscription = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    subscription_data: unknown;
    device_id: string;
    user_id: number;
};
export type UserSession = {
    id: string;
    created_at: Generated<Timestamp>;
    scope: string;
    user_id: number;
};
export type UserTag = {
    id: Generated<number>;
    created_at: Generated<Timestamp>;
    user_id: number;
    content: string;
};
export type UserValidationToken = {
    id: string;
    created_at: Generated<Timestamp>;
    purpose: string;
    user_id: number;
};
export type DB = {
    cookbook_shares: CookbookShare;
    cookbooks: Cookbook;
    known_ingredients: KnownIngredient;
    meal_plan_items: MealPlanItem;
    meal_plan_shares: MealPlanShare;
    meal_plans: MealPlan;
    notifications: Notification;
    recipe_cookbook_attachments: RecipeCookbookAttachment;
    recipe_ingredients: RecipeIngredient;
    recipe_shares: RecipeShare;
    recipe_steps: RecipeStep;
    recipe_tag_attachments: RecipeTagAttachment;
    recipes: Recipe;
    shopping_list_items: ShoppingListItem;
    shopping_list_shares: ShoppingListShare;
    shopping_lists: ShoppingList;
    side_jobs: SideJob;
    user_access_records: UserAccessRecord;
    user_credentials: UserCredentials;
    user_kitchen_membership_notification_attachments: UserKitchenMembershipNotificationAttachment;
    user_kitchen_memberships: UserKitchenMembership;
    user_push_notification_subscriptions: UserPushNotificationSubscription;
    user_sessions: UserSession;
    user_tags: UserTag;
    user_validation_tokens: UserValidationToken;
    users: User;
};
