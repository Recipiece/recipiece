import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { ROUTES } from "./api";
import { basicAuthMiddleware, tokenAuthMiddleware } from "./middleware";

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan(":method :url :status - :response-time ms"));

ROUTES.forEach((route) => {
  console.log(`configuring routing for ${route.path}`);
  switch (route.authentication) {
    case "token":
      app.use(route.path, tokenAuthMiddleware);
      break;
    case "basic":
      app.use(route.path, basicAuthMiddleware);
      break;
    case "none":
      console.warn(`  no auth specified for ${route.path}!`);
      break;
  }

  switch (route.method) {
    case "POST":
      // @ts-ignore
      app.post(route.path, route.function);
      break;
    case "GET":
      // @ts-ignore
      app.get(route.path, route.function);
      break;
    case "PUT":
      // @ts-ignore
      app.put(route.path, route.function);
      break;
    case "DELETE":
      // @ts-ignore
      app.put(route.path, route.function);
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
