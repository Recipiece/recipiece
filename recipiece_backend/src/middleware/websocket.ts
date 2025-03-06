import { Redis } from "@recipiece/database";
import { ExtendedWebSocket } from "websocket-express";
import { WebsocketTokenPayload } from "../types";

const OPEN_CONNECTIONS_MAP = new Map<string, ExtendedWebSocket>();

export const storeWebsocket = (broadcastId: string, websocket: ExtendedWebSocket) => {
  OPEN_CONNECTIONS_MAP.set(broadcastId, websocket);
};

export const closeConnection = async (wsToken: string) => {
  // remove the token from redis
  const redis = await Redis.getInstance();
  const values = (await redis.HGETALL(`ws:${wsToken}`)) as unknown as WebsocketTokenPayload;
  const { entity_id, entity_type } = values;
  const sMembersKey = `${entity_type}:${entity_id}`;
  await redis.SREM(sMembersKey, wsToken);

  // clear the websocket from the map
  OPEN_CONNECTIONS_MAP.delete(wsToken);
};

export const broadcastMessageViaEntityId = async (entityType: string, entityId: number, message: any) => {
  const redis = await Redis.getInstance();
  const broadcastIds = await redis.SMEMBERS(`${entityType}:${entityId}`);

  const promises = broadcastIds.map(async (broadcastId) => {
    const storedWebsocket = OPEN_CONNECTIONS_MAP.get(broadcastId);
    if (storedWebsocket) {
      return new Promise<void>((resolve) => {
        storedWebsocket.send(JSON.stringify(message));
        resolve();
      });
    } else {
      console.warn(`broadcastId ${broadcastId} has no corresponding websocket, clearing its session from cache`);
      return await redis.SREM(`${entityType}:${entityId}`, broadcastId);
    }
  });
};

export const broadcastMessageViaWebsocketToken = async (wsToken: string, message: any) => {
  const redis = await Redis.getInstance();
  const values = (await redis.HGETALL(`ws:${wsToken}`)) as unknown as WebsocketTokenPayload;
  const { entity_id, entity_type } = values;
  const sMembersKey = `${entity_type}:${entity_id}`;
  const broadcastIds = await redis.SMEMBERS(sMembersKey);

  const promises = broadcastIds.map(async (broadcastId) => {
    const storedWebsocket = OPEN_CONNECTIONS_MAP.get(broadcastId);
    if (storedWebsocket) {
      return new Promise<void>((resolve) => {
        storedWebsocket.send(JSON.stringify(message));
        resolve();
      });
    } else {
      console.warn(`broadcastId ${broadcastId} has no corresponding websocket, clearing its session from cache`);
      return await redis.SREM(sMembersKey, broadcastId);
    }
  });

  return Promise.all(promises);
};
