import { InferType } from "yup";
export declare const YShoppingListItemSchema: import("yup").ObjectSchema<{
    id: number;
    shopping_list_id: number;
    completed: NonNullable<boolean | undefined>;
    order: number;
    content: string;
    notes: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    shopping_list_id: undefined;
    completed: undefined;
    order: undefined;
    content: undefined;
    notes: undefined;
}, "">;
export declare const YShoppingListShareSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    shopping_list_id: number;
    user_kitchen_membership_id: number;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    shopping_list_id: undefined;
    user_kitchen_membership_id: undefined;
}, "">;
export declare const YShoppingListSchema: import("yup").ObjectSchema<{
    id: number;
    name: string;
    created_at: Date;
    user_id: number;
    items: import("yup").Maybe<{
        notes?: import("yup").Maybe<string | undefined>;
        id: number;
        order: number;
        content: string;
        shopping_list_id: number;
        completed: NonNullable<boolean | undefined>;
    }[] | undefined>;
    shares: import("yup").Maybe<{
        id: number;
        created_at: Date;
        user_kitchen_membership_id: number;
        shopping_list_id: number;
    }[] | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    name: undefined;
    created_at: undefined;
    user_id: undefined;
    items: undefined;
    shares: undefined;
}, "">;
export interface ShoppingListSchema extends InferType<typeof YShoppingListSchema> {
}
export interface ShoppingListItemSchema extends InferType<typeof YShoppingListItemSchema> {
}
export interface ShoppingListShareSchema extends InferType<typeof YShoppingListShareSchema> {
}
/**
 * Create shopping list
 */
export declare const YCreateShoppingListRequestSchema: import("yup").ObjectSchema<{
    name: string;
}, import("yup").AnyObject, {
    name: undefined;
}, "">;
export interface CreateShoppingListRequestSchema extends InferType<typeof YCreateShoppingListRequestSchema> {
}
/**
 * Update shopping list
 */
export declare const YUpdateShoppingListRequestSchema: import("yup").ObjectSchema<{
    id: number;
    name: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    name: undefined;
}, "">;
export interface UpdateShoppingListRequestSchema extends InferType<typeof YUpdateShoppingListRequestSchema> {
}
/**
 * List shopping lists schema
 */
export declare const YListShoppingListsQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    shared_shopping_lists: import("yup").Maybe<"include" | "exclude" | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    shared_shopping_lists: undefined;
}, "">;
export interface ListShoppingListsQuerySchema extends InferType<typeof YListShoppingListsQuerySchema> {
}
export declare const YListShoppingListsResponseSchema: import("yup").ObjectSchema<{
    data: {
        shares?: import("yup").Maybe<{
            id: number;
            created_at: Date;
            user_kitchen_membership_id: number;
            shopping_list_id: number;
        }[] | undefined>;
        items?: import("yup").Maybe<{
            notes?: import("yup").Maybe<string | undefined>;
            id: number;
            order: number;
            content: string;
            shopping_list_id: number;
            completed: NonNullable<boolean | undefined>;
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
export interface ListShoppingListsResponseSchema extends InferType<typeof YListShoppingListsResponseSchema> {
}
/**
 * Request shopping list session
 */
export declare const YRequestShoppingListSessionResponseSchema: import("yup").ObjectSchema<{
    token: string;
}, import("yup").AnyObject, {
    token: undefined;
}, "">;
export interface RequestShoppingListSessionResponseSchema extends InferType<typeof YRequestShoppingListSessionResponseSchema> {
}
export declare const YModifyShoppingListMessage: import("yup").ObjectSchema<{
    action: string | undefined;
    item: {
        id?: number | undefined;
        order?: number | undefined;
        notes?: import("yup").Maybe<string | undefined>;
        content?: string | undefined;
        shopping_list_id?: number | undefined;
        completed?: NonNullable<boolean | undefined> | undefined;
    } | null | undefined;
}, import("yup").AnyObject, {
    action: undefined;
    item: undefined;
}, "">;
export interface ModifyShoppingListMessage extends InferType<typeof YModifyShoppingListMessage> {
}
export declare const YModifyShoppingListResponse: import("yup").ObjectSchema<{
    responding_to_action: string | undefined;
    items: {
        notes?: import("yup").Maybe<string | undefined>;
        id: number;
        order: number;
        content: string;
        shopping_list_id: number;
        completed: NonNullable<boolean | undefined>;
    }[];
}, import("yup").AnyObject, {
    responding_to_action: undefined;
    items: undefined;
}, "">;
export interface ModifyShoppingListResponse extends InferType<typeof YModifyShoppingListResponse> {
}
/**
 * Append Shopping List Items
 */
export declare const YAppendShoppingListItemsRequestSchema: import("yup").ObjectSchema<{
    shopping_list_id: number;
    items: {
        notes?: import("yup").Maybe<string | undefined>;
        content: string;
    }[];
}, import("yup").AnyObject, {
    shopping_list_id: undefined;
    items: undefined;
}, "">;
export interface AppendShoppingListItemsRequestSchema extends InferType<typeof YAppendShoppingListItemsRequestSchema> {
}
export declare const YAppendShoppingListItemsResponseSchema: import("yup").ArraySchema<{
    notes?: import("yup").Maybe<string | undefined>;
    id: number;
    order: number;
    content: string;
    shopping_list_id: number;
    completed: NonNullable<boolean | undefined>;
}[], import("yup").AnyObject, undefined, "">;
export interface AppendShoppingListItemsResponseSchema extends InferType<typeof YAppendShoppingListItemsResponseSchema> {
}
/**
 * Create ShoppingList Share
 */
export declare const YCreateShoppingListShareRequestSchema: import("yup").ObjectSchema<{
    user_kitchen_membership_id: number;
    shopping_list_id: number;
}, import("yup").AnyObject, {
    user_kitchen_membership_id: undefined;
    shopping_list_id: undefined;
}, "">;
export interface CreateShoppingListShareRequestSchema extends InferType<typeof YCreateShoppingListShareRequestSchema> {
}
/**
 * List ShoppingList Shares
 */
export declare const YListShoppingListSharesQuerySchema: import("yup").ObjectSchema<{
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
export interface ListShoppingListSharesQuerySchema extends InferType<typeof YListShoppingListSharesQuerySchema> {
}
export declare const YListShoppingListSharesResponseSchema: import("yup").ObjectSchema<{
    data: {
        id: number;
        created_at: Date;
        user_kitchen_membership_id: number;
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
        shopping_list_id: number;
        shopping_list: {
            id: number;
            name: string;
        };
    }[];
    has_next_page: NonNullable<boolean | undefined>;
    page: number;
}, import("yup").AnyObject, {
    data: undefined;
    has_next_page: undefined;
    page: undefined;
}, "">;
export interface ListShoppingListSharesResponseSchema extends InferType<typeof YListShoppingListSharesResponseSchema> {
}
//# sourceMappingURL=shoppingList.d.ts.map