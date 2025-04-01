import { randomUUID } from "crypto";
import { Environment } from "./environment";

export interface LoggerOpts {
  readonly name: string;
  readonly disabledEnvs?: string[];
}

export class Logger {
  public readonly name;
  public readonly disabledEnvs: string[];

  private constructor(private readonly opts: LoggerOpts) {
    this.name = this.opts.name;
    this.disabledEnvs = this.opts.disabledEnvs ?? [];
  }

  public static getLogger(opts?: LoggerOpts): Logger {
    const newOpts: LoggerOpts = {
      ...(opts ?? {
        name: randomUUID().toString(),
        disabledEnvs: [],
      }),
    };
    return new Logger(newOpts);
  }

  public log(message?: any, ...optionalParams: any[]) {
    if (this.disabledEnvs.find((v) => v === Environment.ENVIRONMENT)) {
      return;
    }
    console.log(message, ...optionalParams);
  }

  public error(message?: any, ...optionalParams: any[]) {
    if (this.disabledEnvs.find((v) => v === Environment.ENVIRONMENT)) {
      return;
    }
    console.error(message, ...optionalParams);
  }

  public warn(message?: any, ...optionalParams: any[]) {
    if (this.disabledEnvs.find((v) => v === Environment.ENVIRONMENT)) {
      return;
    }
    console.warn(message, ...optionalParams);
  }
}
