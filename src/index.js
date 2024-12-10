import { GraphQLServer, PubSub } from "graphql-yoga";
import { Prisma, PrismaClient } from "@prisma/client"; //Import Prisma client
import bcrypt from "bcrypt"; //Import bcrypt
import jwt from "jsonwebtoken"; //Import jwt
import rateLimit from "express-rate-limit"; //Import the rate-limiting middleware

import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import Product from "./resolvers/Product";
import User from "./resolvers/User";
import Order from "./resolvers/Order";
import Review from "./resolvers/Review";
import db from "./db";
import Subscription from "./resolvers/Subscription";

//Creating an instance of PubSub
const pubsub = new PubSub();

//Creating an instance of prisma client
const prisma = new PrismaClient();

//Define a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //Limit each IP to 100 requests per WindowMs
  message: "Too many requests from this IP, please try again later",
});

//Creating the server
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
  //Pass the mock database and PubSub instance to all resolvers
  context: function ({ request }) {
    return {
      prisma,
      pubsub,
      bcrypt, //Encryption purposes
      jwt, //JSON Web Token
      request, //Include the request object
    };
  },
});

//Apply the rate limiter to the server
server.express.use(limiter); //Attach the rate-limiting middleware to the Express server

//Starting the server on PORT 3000
server.start({ port: 3000 }, () => {
  console.log("Server starting now ...");
});
