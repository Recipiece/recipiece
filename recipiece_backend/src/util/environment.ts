export class Environment {
  public static get PORT(): number {
    return +process.env.APP_PORT!;
  }

  public static get DATABASE_URL(): string {
    return process.env.DATABASE_URL!;
  }

  public static get REDIS_QUEUE_URL(): string {
    return process.env.REDIS_QUEUE_URL!;
  }

  public static get REDIS_URL(): string {
    return process.env.REDIS_URL!;
  }

  public static get RECIPE_PARSER_SERVICE_URL(): string {
    return process.env.APP_RECIPE_PARSER_SERVICE_URL!;
  }

  public static get SECRET(): string {
    return process.env.APP_SECRET!;
  }

  public static get SEND_EMAIL(): boolean {
    return process.env.APP_SEND_EMAIL === "Y";
  }

  public static get EMAIL_HOST(): string | undefined {
    return process.env.APP_EMAIL_HOST;
  }

  public static get EMAIL_ADDRESS(): string | undefined {
    return process.env.APP_EMAIL_ADDRESS;
  }

  public static get EMAIL_PASSWORD(): string | undefined {
    return process.env.APP_EMAIL_PASSWORD;
  }

  public static get ENVIRONMENT(): string {
    return process.env.APP_ENVIRONMENT!;
  }

  public static get VERSION(): string {
    return process.env.APP_VERSION!;
  }

  public static get VAPID_PUBLIC_KEY(): string | undefined {
    return process.env.APP_VAPID_PUBLIC_KEY;
  }

  public static get VAPID_PRIVATE_KEY(): string | undefined {
    return process.env.APP_VAPID_PRIVATE_KEY;
  }

  public static get ENABLE_PUSH_NOTIFICATIONS(): boolean {
    return process.env.APP_ENABLE_PUSH_NOTIFICATIONS === "Y";
  }

  public static get ENABLE_TURNSTILE(): boolean {
    return process.env.APP_ENABLE_TURNSTILE === "Y";
  }

  public static get TURNSTILE_SECRET_KEY(): string | undefined {
    return process.env.APP_TURNSTILE_SECRET_KEY;
  }

  public static get S3_SECRET_KEY(): string | undefined {
    return process.env.APP_S3_SECRET_KEY;
  }

  public static get S3_ACCESS_KEY_ID(): string | undefined {
    return process.env.S3_ACCESS_KEY_ID;
  }

  public static get S3_BUCKET(): string | undefined {
    return process.env.APP_S3_BUCKET;
  }

  public static get S3_ENDPOINT(): string | undefined {
    return process.env.APP_S3_ENDPOINT;
  }

  public static get S3_CDN_ENDPOINT(): string | undefined {
    return process.env.APP_S3_CDN_ENDPOINT ?? this.S3_ENDPOINT;
  }
}