import { AnyObject, InferType, Maybe, ObjectSchema } from "yup";
export declare const YListQuerySchema: ObjectSchema<{
    page_number: number;
    page_size: Maybe<number | undefined>;
}, AnyObject, {
    page_number: undefined;
    page_size: undefined;
}, "">;
export interface ListQuerySchema extends InferType<typeof YListQuerySchema> {
}
export declare function generateYListQuerySchema<T extends Maybe<AnyObject>>(dataSchema: ObjectSchema<T>): ObjectSchema<{
    data: (T extends AnyObject ? import("yup").MakePartial<T> extends infer T_1 ? T_1 extends import("yup").MakePartial<T> ? T_1 extends {} ? { [k in keyof T_1]: T_1[k]; } : T_1 : never : never : T)[];
    has_next_page: NonNullable<boolean | undefined>;
    page: number;
}, AnyObject, {
    data: undefined;
    has_next_page: undefined;
    page: undefined;
}, "">;
//# sourceMappingURL=list.d.ts.map