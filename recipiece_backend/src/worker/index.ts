import { Worker, WorkerOptions } from "worker_threads";
import path from "path";

const generateWorker = (file: string, wkOpts?: WorkerOptions) => {
  const opts: WorkerOptions = { ...(wkOpts || {}) };
  if (process.env.APP_ENVIRONMENT !== "prod") {
    opts.eval = true;
    if (!opts.workerData) {
      opts.workerData = {};
    }
    opts.workerData.__filename = file;
    return new Worker(
      `
          const wk = require('worker_threads');
          require('ts-node').register();
          let file = wk.workerData.__filename;
          delete wk.workerData.__filename;
          require(file);
      `,
      { ...opts }
    );
  } else {
    return new Worker(file.replace(".ts", ".js"), { ...opts });
  }
};

export const generateRecipeImportWorker = () => {
  return generateWorker(path.resolve(__dirname, "./importRecipes.ts"));
};
