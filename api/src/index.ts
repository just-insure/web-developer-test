import pino from "pino";
import { config } from "./config";
import { createGraphQLServer } from "./graphql";
import { createServer } from "./rest";
import { initialise } from "./services/trip";

const logger = pino(config.logger);

logger.debug({ config }, "Starting with config");

const app = createServer(logger);

const start = async () => {
  try {
    const graphqlServer = await createGraphQLServer(logger);
    await initialise(logger);

    app.register(graphqlServer.createHandler());
    await app.ready();
    (app as any).swagger();

    await app.listen(config.http);
  } catch (error) {
    logger.error(error, "Http server error");
    process.exit(1);
  }
};

start();
