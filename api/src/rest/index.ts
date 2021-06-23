import fastify from "fastify";
import { Logger } from "pino";
import { get, getSummaries } from "../services/trip";

export const createServer = (logger: Logger) => {
  const server = fastify({ logger });

  server.register(require("fastify-swagger"), {
    swagger: {
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: "localhost:4000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [{ name: "trip", description: "Trip related end-points" }],
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    exposeRoute: true,
    routePrefix: "/doc",
  });

  server.route({
    method: "GET",
    url: "/trip/:id",
    schema: {
      params: {
        id: { type: "string" },
      },
      response: {
        201: {
          type: "object",
        },
      },
    },
    handler: async (request, response) => {
      const id = request.params["id"];
      const trip = await get(id);

      return trip ? response.send(trip) : response.status(404).send();
    },
  });

  server.route({
    method: "GET",
    url: "/trip",
    schema: {
      response: {
        201: {
          type: "object",
        },
      },
    },
    handler: async (_, response) => {
      const summaries = await getSummaries();

      return summaries ? response.send(summaries) : response.status(404).send();
    },
  });

  return server;
};
