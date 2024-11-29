import { GraphQLServer, PubSub } from "graphql-yoga";
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
  context: {
    db,
    pubsub,
  },
});

//Starting the server on PORT 3000
server.start({ port: 3000 }, () => {
  console.log("Server starting now ...");
});
