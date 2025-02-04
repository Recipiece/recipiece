import { InferType } from "yup";
export declare const YAuthenticatedWebsocketRequestSchema: import("yup").ObjectSchema<{
    authorization: import("yup").Maybe<string | undefined>;
    route: string;
}, import("yup").AnyObject, {
    authorization: undefined;
    route: undefined;
}, "">;
export interface AuthenticatedWebsocketRequestSchema extends InferType<typeof YAuthenticatedWebsocketRequestSchema> {
}
//# sourceMappingURL=websocket.d.ts.map