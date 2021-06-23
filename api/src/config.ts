import { LoggerOptions } from "pino";
const isProduction = process.env?.NODE_ENV === "production";

interface HttpOptions {
  port: number;
  host?: string;
  backlog?: number;
}

interface Config {
  http: HttpOptions;
  logger: LoggerOptions;
  general: {
    rootPath: string;
  };
  gql: {
    playground?: boolean;
    introspection?: boolean;
  };
}

export const config: Config = {
  http: {
    port: parseInt(process.env.PORT, 10) || 4000,
  },
  logger: {
    level: process.env.LOG_LEVEL ?? "trace",
    prettyPrint: !isProduction,
  },
  general: {
    rootPath: __dirname,
  },
  gql: {
    playground: true,
    introspection: true,
  },
};
