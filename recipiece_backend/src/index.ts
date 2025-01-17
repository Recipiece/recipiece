import { prisma } from "@recipiece/database";
import app from "./app";

const server = app.listen(+process.env.APP_PORT!, () => {
  console.log(`listening for connections on ${process.env.APP_PORT}`);
});

const shutdown = () => {
  let redisPromise = Promise.resolve();

  // if(Redis.getInstance()) {
  //   redisPromise = redis.disconnect()
  //     .then(() => {
  //       console.log("redis connection closed");
  //     })
  //     .catch(console.error);
  // }

  const prismaPromise = prisma
    .$disconnect()
    .then(() => {
      console.log("database connection closed");
    })
    .catch(console.error);

  Promise.all([redisPromise, prismaPromise]).finally(() => {
    server.close(() => {
      console.log("goodbye!");
    });
  });
};

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down server");
  shutdown();
});

process.on("exit", () => {
  console.log("exit received, shutting down server");
  shutdown();
});
