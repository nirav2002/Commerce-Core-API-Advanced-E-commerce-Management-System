import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";

//Demo Product Data

const products = [
  {
    id: "1",
    name: "Wireless Mouse",
    price: 25.99,
    categoryID: "1",
    inStock: true,
  },
  {
    id: "2",
    name: "Yoga Mat",
    price: 19.99,
    categoryID: "2",
    inStock: true,
  },
  {
    id: "3",
    name: "Water Bottle",
    price: 9.99,
    categoryID: "3",
    inStock: false,
  },
  {
    id: "4",
    name: "Gaming Chair",
    price: 199.99,
    categoryID: "4",
    inStock: true,
  },
  {
    id: "5",
    name: "Bluetooth Speaker",
    price: 49.99,
    categoryID: "1",
    inStock: true,
  },
  {
    id: "6",
    name: "Resistance Bands",
    price: 15.99,
    categoryID: "2",
    inStock: true,
  },
  {
    id: "7",
    name: "Coffee Maker",
    price: 89.99,
    categoryID: "3",
    inStock: true,
  },
];

//Demo Categories data

const categories = [
  {
    id: "1",
    name: "Electronics",
    description: "Devices and gadgets for everyday use",
    products: ["1", "5"],
  },
  {
    id: "2",
    name: "Fitness",
    description: "Gear and equipment for staying fit",
    products: ["2", "6"],
  },
  {
    id: "3",
    name: "Kitchen",
    description: "Essential tools and accessories for your kitchen",
    products: ["3", "7"],
  },
  {
    id: "4",
    name: "Furniture",
    description: "Comfortable and stlyish furniture for home or office",
    products: ["4"],
  },
];

//Demo Users data

const users = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    age: 28,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    age: 35,
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    age: 22,
  },
  {
    id: "4",
    name: "Diana Price",
    email: "diana.prince@example.com",
  },
];

//Demo Orders data

const orders = [
  {
    id: "1",
    totalAmount: 25.99,
    status: "Shipped",
    orderDate: "2024-11-01",
    userID: "1",
    productID: "1",
    companyID: "1",
  },
  {
    id: "2",
    totalAmount: 25.99,
    status: "Processing",
    orderDate: "2024-11-02",
    userID: "1",
    productID: "1",
    companyID: "1",
  },
  {
    id: "3",
    totalAmount: 19.99,
    status: "Delivered",
    orderDate: "2024-10-28",
    userID: "2",
    productID: "2",
    companyID: "2",
  },
  {
    id: "4",
    totalAmount: 19.99,
    status: "Cancelled",
    orderDate: "2024-11-03",
    userID: "3",
    productID: "2",
    companyID: "2",
  },
  {
    id: "5",
    totalAmount: 9.99,
    status: "Processing",
    orderDate: "2024-11-05",
    userID: "2",
    productID: "3",
    companyID: "3",
  },
  {
    id: "6",
    totalAmount: 199.99,
    status: "Processing",
    orderDate: "2024-11-05",
    userID: "4",
    productID: "4",
    companyID: "4",
  },
  {
    id: "7",
    totalAmount: 49.99,
    status: "Delivered",
    orderDate: "2024-11-06",
    userID: "4",
    productID: "5",
    companyID: "1",
  },
  {
    id: "8",
    totalAmount: 15.99,
    status: "Shipped",
    orderDate: "2024-11-07",
    userID: "1",
    productID: "6",
    companyID: "2",
  },
  {
    id: "9",
    totalAmount: 89.99,
    status: "Delivered",
    orderDate: "2024-11-08",
    userID: "3",
    productID: "7",
    companyID: "3",
  },
];

//Demo Reviews data

const reviews = [
  {
    id: "1",
    productID: "1",
    userID: "1", // Link to User
    rating: 4.5,
    comment: "Amazing product! Highly recommended",
  },
  {
    id: "2",
    productID: "1",
    userID: "2", // Link to User
    rating: 4.0,
    comment: "Works as expected, but could be slightly cheaper",
  },
  {
    id: "3",
    productID: "2",
    userID: "3", // Link to User
    rating: 5.0,
    comment: "Excellent quality and very durable",
  },
  {
    id: "4",
    productID: "3",
    userID: "4", // Link to User
    rating: 3.5,
    comment: "Decent product, but not great for the price",
  },
  {
    id: "5",
    productID: "4",
    userID: "2", // Link to User
    rating: 4.8,
    comment: "Super comfortable and worth every penny",
  },
  {
    id: "6",
    productID: "5",
    userID: "1", // Link to User
    rating: 4.2,
    comment: "Good sound quality and easy to use",
  },
  {
    id: "7",
    productID: "6",
    userID: "3", // Link to User
    rating: 4.7,
    comment: "Perfect for daily workouts",
  },
  {
    id: "8",
    productID: "7",
    userID: "4", // Link to User
    rating: 4.0,
    comment: "Makes the best coffee I've had",
  },
];

//Demo Companies data
const companies = [
  {
    id: "1",
    name: "TechGear Inc.",
    location: "San Francisco, CA",
    industry: "Electronics",
  },
  {
    id: "2",
    name: "FitLife Co.",
    location: "Austin, TX",
    industry: "Fitness",
  },
  {
    id: "3",
    name: "HomeEssentials Ltd.",
    location: "New York, NY",
    industry: "Kitchen",
  },
  {
    id: "4",
    name: "FurniturePros",
    location: "Chicago, IL",
    industry: "Furniture",
  },
  {
    id: "5",
    name: "GadgetsWorld",
    location: "Seattle, WA",
    industry: "Electronics",
  },
];

//Type Definitions (schema)
const typeDefs = `
    type Query {
        products: [Product!]!
        categories: [Category!]!
        users: [User!]!
        orders: [Order!]!
        reviews: [Review!]!
        companies: [Company!]!
    }

    type Mutation {
        createProduct(data: CreateProductInput!): Product!
        createCategory(data: CreateCategoryInput!): Category!
        createUser(data: CreateUserInput!): User!
        createOrder(data: CreateOrderInput!): Order!
        createReview(data: CreateReviewInput!): Review!
        createCompany(data: CreateCompanyInput!): Company!
    }
    
    type Product {
        id: ID!
        name: String!
        price: Float!
        inStock: Boolean!
        category: Category!
        orders: [Order!]!
        reviews: [Review!]!
    }

    type Category {
        id: ID!
        name: String!
        description: String
        products: [Product!]!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        orders: [Order!]!
        reviews: [Review!]!
    }

    type Order {
        id: ID!
        totalAmount: Float!
        status: String!
        orderDate: String!
        user: User!
        product: Product!
        company: Company!
    }

    type Review {
        id: ID!
        product: Product!
        user: User!
        rating: Float!
        comment: String!
    }

    type Company {
        id: ID!
        name: String!
        location: String!
        industry: String!
    }

    input CreateProductInput {
        name: String!
        price: Float!
        categoryID: ID!
        inStock: Boolean!
    }

    input CreateCategoryInput {
        name: String!
        description: String
        products: [ID!]
    }
    
    input CreateUserInput {
        name: String!
        email: String
        age: Int
    }

    input CreateOrderInput {
        totalAmount: Float!
        status: String!
        orderDate: String!
        userID: ID!
        productID: ID!
        companyID: ID!
    }

    input CreateReviewInput {
        productID: ID!
        userID: ID!
        rating: Float!
        comment: String!
    }

    input CreateCompanyInput {
        name: String!
        location: String!
        industry: String!
    }
`;

//Resolvers
const resolvers = {
  Query: {
    products(parent, args, ctx, info) {
      return products;
    },
    categories(parent, args, ctx, info) {
      return categories;
    },
    users(parent, args, ctx, info) {
      return users;
    },
    orders(parent, args, ctx, info) {
      return orders;
    },
    reviews(parent, args, ctx, info) {
      return reviews;
    },
    companies(parent, args, ctx, info) {
      return companies;
    },
  },
  Mutation: {
    createProduct(parent, args, ctx, info) {
      //Validate that the categoryID exists
      const categoryExists = categories.some((category) => {
        return category.id === args.data.categoryID;
      });

      //If category does not exist
      if (!categoryExists) {
        throw new Error("Category not found");
      }

      //Create the product
      const product = {
        //Create a unique ID
        id: uuidv4(),
        ...args.data,
      };

      //Adding the product to the products array
      products.push(product);
      return product;
    },
    createCategory(parent, args, ctx, info) {
      //Validate if the product IDS provided through args exist in the products
      const productExists = args.data.products.filter(
        (productID) => !products.some((product) => product.id === productID)
      );

      //If there are invalid product IDs,
      if (productExists.length > 0) {
        throw new Error("Invalid Product IDs given");
      }

      //Check if the category name already exists or not
      const categoryExists = categories.some((category) => {
        return category.name.toLowerCase() === args.data.name.toLowerCase();
      });

      if (categoryExists) {
        throw new Error(`Category name ${args.data.name} already exists`);
      }

      //Create the new category object
      const category = {
        //Generate a unique ID for the category
        id: uuidv4(),
        ...args.data,
      };

      //Add the new category to the categories array
      categories.push(category);

      return category;
    },
    createUser(parent, args, ctx, info) {
      //To check if the email entered is unique or not
      const emailExists = users.some((user) => {
        return user.email === args.data.email;
      });

      //If Email Id already exists
      if (emailExists) {
        throw new Error("Email already in use");
      }

      const user = {
        //Create a new unique ID for the user
        id: uuidv4(),
        ...args.data,
      };

      //Adding the user to the users array
      users.push(user);

      return user;
    },
    createOrder(parent, args, ctx, info) {
      //Validate if the user ID provided through args exists or not in the users
      const userExists = users.some((user) => {
        return user.id === args.data.userID;
      });

      //If user does not exist
      if (!userExists) {
        throw new Error("User not found");
      }

      //Validate if the product ID provided through args exists or not in the users
      const productExists = products.find((product) => {
        return product.id === args.data.productID;
      });

      //If product does not exist
      if (!productExists) {
        throw new Error("Product not found");
      }

      //Check if the product is in stock or not
      if (!productExists.inStock) {
        throw new Error("Product is out of stock");
      }

      //Validate company ID
      const companyExists = companies.some((company) => {
        return company.id === args.data.companyID;
      });

      if (!companyExists) {
        throw new Error("Company not found");
      }

      //Create the new order object
      const order = {
        id: uuidv4(),
        ...args.data,
      };

      //Add the order to the orders array
      orders.push(order);

      return order;
    },
    createReview(parent, args, ctx, info) {
      //Validate product ID
      const productExists = products.find((product) => {
        return product.id === args.data.productID;
      });

      //If product does not exist
      if (!productExists) {
        throw new Error("Product not found");
      }

      //Validate user ID
      const userExists = users.find((user) => {
        return user.id === args.data.userID;
      });

      //If user not found
      if (!userExists) {
        throw new Error("User not found");
      }

      //Validate rating
      if (args.data.rating < 0 || args.data.rating > 5) {
        throw new Error("Rating must be between 0 and 5");
      }

      //Create the review object
      const review = {
        //Create a unique id for each review
        id: uuidv4(),
        ...args.data,
      };

      //Add the review to the reviews array
      reviews.push(review);

      return review;
    },
    createCompany(parent, args, ctx, info) {
      //Validate that the company name given through the args does not actually exist
      const companyExists = companies.some((company) => {
        return company.name.toLowerCase() === args.data.name.toLowerCase();
      });

      //If company name already exists
      if (companyExists) {
        throw new Error("Company name already exists");
      }

      //Create a new company object
      const company = {
        //Create a unique ID for company
        id: uuidv4(),
        ...args.data,
      };

      //Add the new company to the companies array
      companies.push(company);

      return company;
    },
  },

  Product: {
    category(parent, args, ctx, info) {
      return categories.find((category) => {
        return category.id === parent.categoryID;
      });
    },
    orders(parent, args, ctx, info) {
      return orders.filter((order) => {
        return order.productID === parent.id;
      });
    },
    reviews(parent, args, ctx, info) {
      return reviews.filter((review) => {
        //Match the associated product ID on reviews to the productID (parent's)
        return (review.productID = parent.id);
      });
    },
  },
  Category: {
    products(parent, args, ctx, info) {
      return parent.products.map((productID) =>
        products.find((product) => product.id === productID)
      );
    },
  },

  Order: {
    user(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.userID;
      });
    },
    product(parent, args, ctx, info) {
      return products.find((product) => {
        return product.id === parent.productID;
      });
    },
    company(parent, args, ctx, info) {
      return companies.find((company) => {
        return company.id === parent.companyID;
      });
    },
  },
  User: {
    orders(parent, args, ctx, info) {
      return orders.filter((order) => {
        return order.userID === parent.id;
      });
    },
    reviews(parent, args, ctx, info) {
      return reviews.filter((review) => {
        return review.userID === parent.id;
      });
    },
  },
  Review: {
    user(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.userID;
      });
    },
    product(parent, args, ctx, info) {
      return products.find((product) => {
        return product.id === parent.productID;
      });
    },
  },
};

//Creating the server
const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

//Starting the server on PORT 3000
server.start({ port: 3000 }, () => {
  console.log("Server starting now ...");
});
