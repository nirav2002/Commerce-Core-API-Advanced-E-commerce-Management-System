import { GraphQLServer, PubSub } from "graphql-yoga";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import Product from "./resolvers/Product";
import User from "./resolvers/User";
import Order from "./resolvers/Order";
import Review from "./resolvers/Review";
import Subscription from "./resolvers/Subscription";

// PubSub for subscriptions
const pubsub = new PubSub();

// Prisma Client: uses the test database or production based on environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.NODE_ENV === "test"
          ? process.env.DATABASE_TEST_URL
          : process.env.DATABASE_URL,
    },
  },
});

// Rate limiter middleware for security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP
  message: "Too many requests, please try again later.",
});

// GraphQL Server setup
const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: {
    Query,
    Mutation,
    Product,
    User,
    Order,
    Review,
    Subscription,
  },
  context: ({ request }) => ({
    prisma,
    pubsub,
    bcrypt,
    jwt,
    request,
    logger,
  }),
});

// Rate limiter for security
server.express.use(limiter);

// Function to start the server
const startServer = (port = 4000) => {
  return new Promise((resolve) => {
    const serverInstance = server.start({ port }, () => {
      logger.info(`Server is running on http://localhost:${port}`);
      resolve(serverInstance);
    });
  });
};

// Start the appropriate server
if (require.main === module) {
  const port = process.env.NODE_ENV === "test" ? 4000 : 3000;
  startServer(port);
}

export { startServer, server };
