export const DEFAULT_PAGE_SIZE = 100;

export class RecipeImportFiles {
  public static readonly MAX_SIZE = 4000000;
  public static readonly SUPPORTED_EXTENSIONS = [".paprikarecipes"];
  public static readonly TMP_DIR = "/tmp/recipe_import";
  public static readonly IMPORT_TOPIC = "recipiece_file_import";
}

// a surprise tool that will help us later
export const VERSION_ACCESS_LEVELS: { readonly [key: string]: string[] } = {
  cast_iron_skillet: ["alpha"],
};

export class UserSessions {
  public static readonly ACCESS_TOKEN_SCOPE = "access_token";
  public static readonly REFRESH_TOKEN_SCOPE = "refresh_token";

  public static readonly ACCESS_TOKEN_EXP_JWT = "1h";
  public static readonly REFRESH_TOKEN_EXP_JWT = "90d";

  public static readonly ACCESS_TOKEN_EXP_LUXON = { hours: 1 };
  public static readonly REFRESH_TOKEN_EXP_LUXON = { days: 90 };

  // 5 days, in millis
  public static readonly REFRESH_CLOSE_TO_EXPIRY_THRESHOLD_MS = 5 * 24 * 60 * 60 * 1000;
}

export class UserValidationTokenTypes {
  public static readonly TOKEN_COOLDOWN_MS = 5 * 60 * 1000;

  public static readonly ACCOUNT_VERIFICATION = {
    purpose: "account_verification",
    // lasts 1 hour
    duration_ms: 1 * 60 * 60 * 1000,
  };

  public static readonly FORGOT_PASSWORD = {
    purpose: "forgot_password",
    // lasts 1 hour
    duration_ms: 1 * 60 * 60 * 1000,
  };
}

export class Versions {
  public static readonly ALL = "*";
  public static readonly CAST_IRON_SKILLET = "cast_iron_skillet";
}

export class UserKitchenInvitationStatus {
  public static readonly PENDING = "pending";
  public static readonly DENIED = "denied";
  public static readonly ACCEPTED = "accepted";

  public static readonly ALL_STATUSES: [typeof UserKitchenInvitationStatus.PENDING, typeof UserKitchenInvitationStatus.DENIED, typeof UserKitchenInvitationStatus.ACCEPTED] = [
    UserKitchenInvitationStatus.PENDING,
    UserKitchenInvitationStatus.DENIED,
    UserKitchenInvitationStatus.ACCEPTED,
  ];
}

export class JobType {
  public static readonly MEAL_PLAN_ITEM = "meal_plan_item";
  public static readonly MEAL_PLAN_CONFIGURATION = "meal_plan_configuration";
  public static readonly MEAL_PLAN_NOTIFICATION = "meal_plan_notification";
  public static readonly RECIPE_IMPORT = "recipe_import";
}
