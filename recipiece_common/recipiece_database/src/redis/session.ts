import { createClient, RedisClientType } from "redis";

export class Redis {
  private static redis: RedisClientType<any, any, any> | undefined = undefined;

  public static async getInstance(): Promise<RedisClientType<any, any, any>> {
    if (!Redis.redis) {
      Redis.redis = await createClient({
        url: process.env.REDIS_URL!,
      })
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();
    }
    return Redis.redis;
  }
}
