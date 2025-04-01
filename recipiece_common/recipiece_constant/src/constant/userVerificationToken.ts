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
