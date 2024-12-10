import { GraphQLServer, PubSub } from "graphql-yoga";
import { Prisma, PrismaClient } from "@prisma/client"; //Import Prisma client
import bcrypt from "bcrypt"; //Import bcrypt
import jwt from "jsonwebtoken"; //Import jwt
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

//Starting the server on PORT 3000
server.start({ port: 3000 }, () => {
  console.log("Server starting now ...");
});
