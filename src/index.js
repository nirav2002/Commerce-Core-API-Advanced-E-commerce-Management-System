import { GraphQLServer } from "graphql-yoga";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import Product from "./resolvers/Product";
import User from "./resolvers/User";
import Order from "./resolvers/Order";
import Review from "./resolvers/Review";
import db from "./db";

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
  },
  //Pass the mock database to all resolvers
  context: {
    db,
  },
});

//Starting the server on PORT 3000
server.start({ port: 3000 }, () => {
  console.log("Server starting now ...");
});
