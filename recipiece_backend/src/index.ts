import { prisma, Redis } from "@recipiece/database";
import app from "./app";
import { closeWorkers } from "./job/workers";
import { Environment } from "./util/environment";

const server = app.listen(Environment.PORT, () => {
  console.log(`listening for connections on ${Environment.PORT}`);
});

const shutdown = async () => {
  try {
    const redisInstance = await Redis.getInstance();
    await redisInstance.disconnect();
    console.log("redis connection closed");
  } catch (err) {
    console.error(err);
  }

  try {
    await prisma.$disconnect();
    console.log("database connection closed");
  } catch (err) {
    console.error(err);
  }

  try {
    await closeWorkers();
    console.log("workers closed");
  } catch (err) {
    console.error(err);
  }

  server.close((err) => {
    if (err) {
      console.error(err);
    }
    console.log("recipe book closed");
  });

  process.exit();
};

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down server");
  shutdown();
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down server");
  shutdown();
});
