import { ApolloServer, gql } from "apollo-server-fastify";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars";
import path = require("path");
import { promises } from "fs";
import { Logger } from "pino";
import { config } from "../config";
import { get, getSummaries } from "../services/trip";

const resolvers = {
  Query: {
    async trips() {
      const summaries = await getSummaries();
      return summaries;
    },
    async trip(parent, { id }, context, info) {
      const trip = await get(id);
      return trip;
    },
  },
};

const schemaFileLocation = path.join(__dirname, "schema.gql");

export const createGraphQLServer = async (logger: Logger) => {
  const schemaContents = await promises.readFile(schemaFileLocation, "utf-8");

  const schema = makeExecutableSchema({
    typeDefs: [
      gql`
        ${schemaContents}
      `,
      ...scalarTypeDefs,
    ],
    resolvers: {
      ...resolvers,
      ...scalarResolvers,
    },
  });

  const server = new ApolloServer({
    logger,
    ...config.gql,
    schema,
  });

  return server;
};
