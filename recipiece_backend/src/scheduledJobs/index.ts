import { Queue, Worker } from "bullmq";
import { processTimer } from "./timers";

export const timersQueue = new Queue("Timers", {
  connection: {
    url: process.env.REDIS_QUEUE_URL!,
  },
});

for (let i = 0; i < 5; i++) {
  new Worker("Timers", processTimer, {
    connection: {
      url: process.env.REDIS_QUEUE_URL!,
    },
  });
}
