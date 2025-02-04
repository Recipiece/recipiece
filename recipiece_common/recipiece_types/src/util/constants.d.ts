export declare const DEFAULT_PAGE_SIZE = 100;
export declare class RecipeImportFiles {
    static readonly MAX_SIZE = 4000000;
    static readonly SUPPORTED_EXTENSIONS: string[];
    static readonly TMP_DIR = "/tmp/recipe_import";
    static readonly IMPORT_TOPIC = "recipiece_file_import";
}
export declare class UserKitchenInvitationStatus {
    static readonly PENDING = "pending";
    static readonly DENIED = "denied";
    static readonly ACCEPTED = "accepted";
    static readonly ALL_STATUSES: [typeof UserKitchenInvitationStatus.PENDING, typeof UserKitchenInvitationStatus.DENIED, typeof UserKitchenInvitationStatus.ACCEPTED];
}
//# sourceMappingURL=constants.d.ts.map