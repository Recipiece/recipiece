export class StorageKeys {
  public static readonly ACCESS_TOKEN = "recipiece/access_token";
  public static readonly REFRESH_TOKEN = "recipiece/refresh_token";
}

export class Environment {
  public static get IS_CAST_IRON_SKILLET () {
    return Environment.RECIPIECE_VERSION === Environment.VERSION_CAST_IRON_SKILLET;
  }

  public static readonly VERSION_CAST_IRON_SKILLET = "cast_iron_skillet";
  public static readonly RECIPIECE_VERSION = process.env.REACT_APP_RECIPIECE_VERSION;
}

export class Timers {
  public static readonly MAX_TIME_MS = 24 * 60 * 60 * 1000;
}
