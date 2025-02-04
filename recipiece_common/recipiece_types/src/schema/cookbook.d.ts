import { InferType } from "yup";
export declare const YCookbookSchema: import("yup").ObjectSchema<{
    id: number;
    user_id: number;
    name: string;
    description: import("yup").Maybe<string | undefined>;
    created_at: Date;
}, import("yup").AnyObject, {
    id: undefined;
    user_id: undefined;
    name: undefined;
    description: undefined;
    created_at: undefined;
}, "">;
export interface CookbookSchema extends InferType<typeof YCookbookSchema> {
}
/**
 * Create cookbook schema
 */
export declare const YCreateCookbookRequestSchema: import("yup").ObjectSchema<{
    name: string;
    description: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    name: undefined;
    description: undefined;
}, "">;
export interface CreateCookbookRequestSchema extends InferType<typeof YCreateCookbookRequestSchema> {
}
/**
 * Update cookbook schema
 */
export declare const YUpdateCookbookRequestSchema: import("yup").ObjectSchema<{
    id: number;
    name: import("yup").Maybe<string | undefined>;
    description: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    name: undefined;
    description: undefined;
}, "">;
export interface UpdateCookbookRequestSchema extends InferType<typeof YUpdateCookbookRequestSchema> {
}
/**
 * Attach recipe to cookbook schema
 */
export declare const YAddRecipeToCookbookRequestSchema: import("yup").ObjectSchema<{
    cookbook_id: number;
    recipe_id: number;
}, import("yup").AnyObject, {
    cookbook_id: undefined;
    recipe_id: undefined;
}, "">;
export interface AddRecipeToCookbookRequestSchema extends InferType<typeof YAddRecipeToCookbookRequestSchema> {
}
/**
 * Attach recipe to cookbook schema
 */
export declare const YRemoveRecipeFromCookbookRequestSchema: import("yup").ObjectSchema<{
    cookbook_id: number;
    recipe_id: number;
}, import("yup").AnyObject, {
    cookbook_id: undefined;
    recipe_id: undefined;
}, "">;
export interface RemoveRecipeFromCookbookRequestSchema extends InferType<typeof YRemoveRecipeFromCookbookRequestSchema> {
}
/**
 * List cookbooks schema
 */
export declare const YListCookbooksQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    exclude_containing_recipe_id: import("yup").Maybe<number | undefined>;
    search: import("yup").Maybe<string | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    exclude_containing_recipe_id: undefined;
    search: undefined;
}, "">;
export interface ListCookbooksQuerySchema extends InferType<typeof YListCookbooksQuerySchema> {
}
export declare const YListCookbooksResponseSchema: import("yup").ObjectSchema<{
    data: {
        description?: import("yup").Maybe<string | undefined>;
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
export interface ListCookbooksResponseSchema extends InferType<typeof YListCookbooksResponseSchema> {
}
//# sourceMappingURL=cookbook.d.ts.map