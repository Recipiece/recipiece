import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, RequestHandler, Response } from "express";
import morgan from "morgan";
import { ROUTES } from "./api";
import { basicAuthMiddleware, tokenAuthMiddleware, validateRequestBodySchema, validateRequestQuerySchema, validateResponseSchema } from "./middleware";

const app: Express = express();

app.use(cors({}));
app.use(bodyParser.json());
app.use(morgan(":method :url :status - :response-time ms"));

app.use((req: Request, res: Response, next: NextFunction) => {
  setTimeout(() => {
    next();
  }, 1000);
});

ROUTES.forEach((route) => {
  const routeHandlers: RequestHandler[] = [];

  // set up authentication first
  console.log(`configuring routing for ${route.path}`);
  switch (route.authentication) {
    case "token":
      routeHandlers.push(tokenAuthMiddleware);
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

  routeHandlers.push(async (req, res) => {
    // @ts-ignore
    const [statusCode, responseBody] = await route.function(req);
    res.status(statusCode).send(responseBody);
  });

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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({
    message: "Internal error.",
  });
});

export default app;
