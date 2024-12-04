import bodyParser from "body-parser";
import cors from "cors";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import morgan from "morgan";
import { WebSocketExpress, WSResponse } from "websocket-express";
import { ValidationError } from "yup";
import { ROUTES, WEBSOCKET_ROUTES } from "./api";
import {
  basicAuthMiddleware,
  broadcastMessageViaWebsocketToken,
  closeConnection,
  storeWebsocket,
  accessTokenAuthMiddleware,
  validateRequestBodySchema,
  validateRequestQuerySchema,
  validateResponseSchema,
  wsTokenAuthMiddleware,
  refreshTokenAuthMiddleware,
} from "./middleware";
import { WebsocketRequest } from "./types";

const app = new WebSocketExpress();

app.use(cors({}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan(":method :url :status - :response-time ms"));

if (process.env.APP_ENVIRONMENT === "dev") {
  // slow things down locally, cause they're too fast
  app.use((req: Request, res: Response, next: NextFunction) => {
    setTimeout(() => {
      next();
    }, 1000);
  });
}

app.get("/", (_, res) => {
  res.status(StatusCodes.OK).send({version: process.env.APP_VERSION});
});

ROUTES.forEach((route) => {
  const routeHandlers: any[] = [];

  // set up authentication first
  console.log(`configuring routing for ${route.path}`);
  switch (route.authentication) {
    case "access_token":
      routeHandlers.push(accessTokenAuthMiddleware);
      break;
    case "refresh_token":
      routeHandlers.push(refreshTokenAuthMiddleware);
      break;
    case "basic":
      routeHandlers.push(basicAuthMiddleware);
      break;
    case "none":
      console.warn(`  no auth specified for ${route.path}!`);
      break;
  }

  if (route.requestSchema) {
    switch (route.method) {
      case "POST":
      case "PUT":
        routeHandlers.push(validateRequestBodySchema(route.requestSchema));
        break;
      case "GET":
      case "DELETE":
        routeHandlers.push(validateRequestQuerySchema(route.requestSchema));
        break;
    }
  }

  if(route.preMiddleware) {
    console.log(`  installing extra pre-middleware for ${route.path}`);
    routeHandlers.push(...route.preMiddleware);
  }

  routeHandlers.push(async (req: Request, res: Response) => {
    // @ts-ignore
    const [statusCode, responseBody] = await route.function(req);
    res.status(statusCode).send(responseBody);
  });

  if(route.postMiddleware) {
    console.log(`  installing extra post-middleware for ${route.path}`);
    routeHandlers.push(...route.postMiddleware);
  }

  if (route.responseSchema) {
    routeHandlers.push(validateResponseSchema(route.responseSchema));
  }

  switch (route.method) {
    case "POST":
      app.post(route.path, ...routeHandlers);
      break;
    case "GET":
      app.get(route.path, ...routeHandlers);
      break;
    case "PUT":
      app.put(route.path, ...routeHandlers);
      break;
    case "DELETE":
      app.delete(route.path, ...routeHandlers);
      break;
  }
});

/**
 * Websocket flow is a little more complicated than regular requests.
 *
 * Endpoints for websocket requests have to be a little more stateful than the http requests.
 *
 * When a connection comes in, middleware
 *  1. Checks for a `token` query param (this must be present)
 *  2. Checks that the token param is a known token (i.e. in redis)
 *  3. Stores the socket into a map so that it can be broadcast to later on
 *
 * Messages are always assumed to be JSON, and as such the code attempts to JSON.parse the utf-8 encoded message.
 *
 * There's some faux middleware that runs on message received to do
 * similar schema things to the message, both for input and output.
 *
 * Then the message is broadcasted out to all entities that are listening.
 *
 * Tokens are stored in redis in an HMAP structure like
 *  "ws:<token>": {
 *    "entity_id": <id>,
 *    "entity_type": <string>,
 *    "purpose": <string>,
 *  }
 *
 * And then we also store a SET that looks like
 *  "<entity_type>:<entity_id>": [...tokens]
 *
 * On connection close, we'll remove the value from the HMAP, the SET, and the map of token -> websocket.
 *
 * If we are broadcasting a message and we find a token in the SET that doesn't have a corresponding websocket, we'll
 * also kill it in redis.
 */
WEBSOCKET_ROUTES.forEach((route) => {
  console.log(`configuring websocket routing for ${route.path}`);
  app.use(route.path, wsTokenAuthMiddleware);

  app.ws(route.path, async (req: Request, res: WSResponse) => {
    const ws = await res.accept();
    const websocketToken = (req as unknown as WebsocketRequest<any>).ws_token;
    storeWebsocket(websocketToken, ws);

    // @ts-ignore
    ws.ws_token = websocketToken;

    ws.on("message", async (message) => {
      const utfMessage = JSON.parse(message.toString("utf-8"));
      // @ts-ignore
      req.ws_message = utfMessage;

      if (route.requestSchema) {
        try {
          await route.requestSchema.validate(utfMessage);
          // @ts-ignore
          req.ws_message = route.requestSchema.cast(utfMessage);
        } catch (error) {
          console.log(error);
          res.status(StatusCodes.BAD_REQUEST).send((error as ValidationError)?.errors?.join(" "));
          ws.close();
          return;
        }
      }

      const [statusCode, data] = await route.function(req as unknown as WebsocketRequest<any>);

      let broadcastData = data;

      if (route.responseSchema && statusCode === StatusCodes.OK) {
        try {
          await route.responseSchema.validate(data);
          broadcastData = route.responseSchema.cast(data);
        } catch (error) {
          console.log(error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send((error as ValidationError)?.errors?.join(" "));
          ws.close();
          return;
        }
      }

      await broadcastMessageViaWebsocketToken(websocketToken, broadcastData);
    });

    ws.on("close", async () => {
      await closeConnection(websocketToken);
    });
  });
});

export default app;
