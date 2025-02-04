import { InferType } from "yup";
export declare const YTimerSchema: import("yup").ObjectSchema<{
    id: number;
    created_at: Date;
    duration_ms: number;
}, import("yup").AnyObject, {
    id: undefined;
    created_at: undefined;
    duration_ms: undefined;
}, "">;
export interface TimerSchema extends InferType<typeof YTimerSchema> {
}
/**
 * Create timer
 */
export declare const YCreateTimerRequestSchema: import("yup").ObjectSchema<{
    duration_ms: number;
}, import("yup").AnyObject, {
    duration_ms: undefined;
}, "">;
export interface CreateTimerRequestSchema extends InferType<typeof YCreateTimerRequestSchema> {
}
/**
 * Update Timer
 */
export declare const YUpdateTimerRequestSchema: import("yup").ObjectSchema<{
    id: number;
    duration_ms: import("yup").Maybe<number | undefined>;
}, import("yup").AnyObject, {
    id: undefined;
    duration_ms: undefined;
}, "">;
export interface UpdateTimerRequestSchema extends InferType<typeof YUpdateTimerRequestSchema> {
}
/**
 * List timers
 */
export declare const YListTimersQuerySchema: import("yup").ObjectSchema<{
    page_number: number;
    page_size: import("yup").Maybe<number | undefined>;
    user_id: import("yup").Maybe<number | undefined>;
}, import("yup").AnyObject, {
    page_number: undefined;
    page_size: undefined;
    user_id: undefined;
}, "">;
export interface ListTimersQuerySchema extends InferType<typeof YListTimersQuerySchema> {
}
export declare const YListTimersResponseSchema: import("yup").ObjectSchema<{
    data: {
        id: number;
        created_at: Date;
        duration_ms: number;
    }[];
    has_next_page: NonNullable<boolean | undefined>;
    page: number;
}, import("yup").AnyObject, {
    data: undefined;
    has_next_page: undefined;
    page: undefined;
}, "">;
export interface ListTimersResponseSchema extends InferType<typeof YListTimersResponseSchema> {
}
//# sourceMappingURL=timer.d.ts.map