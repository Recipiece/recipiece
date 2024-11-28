export const DEFAULT_PAGE_SIZE = 100;

// a surprise tool that will help us later
export const VERSION_ACCESS_LEVELS: {readonly [key: string]: string[]} = {
  "cast_iron_skillet": ["alpha"],
}

export class UserSessions {
  public static readonly ACCESS_TOKEN_SCOPE = "access_token";
  public static readonly REFRESH_TOKEN_SCOPE = "refresh_token";

  public static readonly ACCESS_TOKEN_EXP_JWT = "1h";
  public static readonly REFRESH_TOKEN_EXP_JWT = "90d";

  public static readonly ACCESS_TOKEN_EXP_LUXON = {hours: 1};
  public static readonly REFRESH_TOKEN_EXP_LUXON = {days: 90};

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
