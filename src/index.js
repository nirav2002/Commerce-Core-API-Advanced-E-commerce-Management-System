import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";

//Demo Product Data

let products = [
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

let categories = [
  {
    id: "1",
    name: "Electronics",
    description: "Devices and gadgets for everyday use",
  },
  {
    id: "2",
    name: "Fitness",
    description: "Gear and equipment for staying fit",
  },
  {
    id: "3",
    name: "Kitchen",
    description: "Essential tools and accessories for your kitchen",
  },
  {
    id: "4",
    name: "Furniture",
    description: "Comfortable and stylish furniture for home or office",
  },
];

//Demo Users data

let users = [
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

let orders = [
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

let reviews = [
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
let companies = [
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
        deleteProduct(id: ID!): Product!
        updateProduct(id: ID!, data: UpdateProductInput!): Product!

        createCategory(data: CreateCategoryInput!): Category!
        deleteCategory(id: ID!): Category!
        updateCategory(id: ID!, data: UpdateCategoryInput!): Category!

        createUser(data: CreateUserInput!): User!
        deleteUser(id: ID!): User!
        updateUser(id: ID!, data: UpdateUserInput!): User!

        createOrder(data: CreateOrderInput!): Order!
        deleteOrder(id: ID!): Order!
        updateOrder(id: ID!, data: UpdateOrderInput!): Order!

        createReview(data: CreateReviewInput!): Review!
        deleteReview(id: ID!): Review!
        updateReview(id: ID!, data: UpdateReviewInput!): Review!

        createCompany(data: CreateCompanyInput!): Company!
        deleteCompany(id: ID!): Company!
        updateCompany(id: ID!, data: UpdateCompanyInput!): Company!
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
    
    input UpdateProductInput {
        name: String
        price: Float
        inStock: Boolean
        categoryID: ID
    }

    input CreateCategoryInput {
        name: String!
        description: String
        products: [ID!]
    }
    
    input UpdateCategoryInput {
        name: String
        description: String
    }

    input CreateUserInput {
        name: String!
        email: String
        age: Int
    }
    
    input UpdateUserInput {
        name: String
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
    
    input UpdateOrderInput {
        totalAmount: Float
        status: String
        orderDate: String
        userID: ID
        productID: ID
        companyID: ID
    }

    input CreateReviewInput {
        productID: ID!
        userID: ID!
        rating: Float!
        comment: String!
    }
    
    input UpdateReviewInput {
        productID: ID
        userID: ID
        rating: Float
        comment: String
    }

    input CreateCompanyInput {
        name: String!
        location: String!
        industry: String!
    }
    
    input UpdateCompanyInput {
        name: String
        location: String
        industry: String
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
    deleteProduct(parent, args, ctx, info) {
      //Find the index of the product to be deleted
      const productIndex = products.findIndex((product) => {
        return product.id === args.id;
      });

      //If product not found
      if (productIndex === -1) {
        throw new Error("Product not found");
      }

      //Remove the product from the products array and store it
      const deletedProduct = products.splice(productIndex, 1); //An array

      //Remove all orders associated with the product
      orders = orders.filter((order) => {
        return order.productID !== args.id;
      });

      //Remove all reviews associated with the product
      reviews = reviews.filter((review) => {
        return review.productID !== args.id;
      });

      return deletedProduct[0];
    },
    updateProduct(parent, args, ctx, info) {
      //Find the product by its ID
      const product = products.find((product) => {
        return product.id === args.id;
      });

      //If product is not found
      if (!product) {
        throw new Error("Product not found");
      }

      //If categoryId is provided, validate it exists
      if (args.data.categoryID) {
        const categoryExists = categories.some((category) => {
          return category.id === args.data.categoryID;
        });
        if (!categoryExists) {
          throw new Error("Invalid category ID");
        }
      }

      //Update the fields if they are provided
      if (typeof args.data.name === "string") {
        product.name = args.data.name;
      }
      if (typeof args.data.price === "number") {
        product.price = args.data.price;
      }
      if (typeof args.data.inStock === "boolean") {
        product.inStock = args.data.inStock;
      }
      if (args.data.categoryID) {
        product.categoryID = args.data.categoryID;
      }

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
    deleteCategory(parent, args, ctx, info) {
      //Find the category index
      const categoryIndex = categories.findIndex((category) => {
        return category.id === args.id;
      });

      //If category not found
      if (categoryIndex === -1) {
        throw new Error("Category not found");
      }

      //Remove the category
      const deletedCategory = categories.splice(categoryIndex, 1); //An array

      //linkedProducts is an array that contains the products that are linked to the category being deleted
      const linkedProducts = products.filter((product) => {
        return product.categoryID === args.id;
      });

      //Find and remove all products linked to the category
      products = products.filter((product) => {
        product.categoryID !== args.id;
      });

      //Remove all orders and reviews associated with the deleted product
      orders = orders.filter((order) => {
        !linkedProducts.some((product) => {
          return product.id === order.productID;
        });
      });

      reviews = reviews.filter((review) => {
        !linkedProducts.some((product) => {
          return product.id === review.productID;
        });
      });

      return deletedCategory[0];
    },
    updateCategory(parent, args, ctx, info) {
      //Find the category by its ID
      const category = categories.find((category) => {
        return category.id === args.id;
      });

      //If category is not found
      if (!category) {
        throw new Error("Category not found");
      }

      //Check if the new name already exists (if provided)
      if (args.data.name) {
        const nameExists = categories.some((category) => {
          return (
            category.name.toLowerCase() === args.data.name.toLowerCase() &&
            category.id !== args.id
          );
        });

        //If name exists
        if (nameExists) {
          throw new Error("Category name already exists");
        }
      }

      //Update the fields if they are provided
      if (typeof args.data.name === "string") {
        category.name = args.data.name;
      }
      if (typeof args.data.description === "string") {
        category.description = args.data.description;
      }
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
    deleteUser(parent, args, ctx, info) {
      //Validate if the user exists
      const userIndex = users.findIndex((user) => {
        return user.id === args.id;
      });

      //If user not found
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      //Remove the user
      const deletedUser = users.splice(userIndex, 1); //An array

      //Remove all orders and reviews created by the user
      orders = orders.filter((order) => {
        return order.userID !== args.id;
      });

      reviews = reviews.filter((review) => {
        return review.userID !== args.id;
      });

      return deletedUser[0];
    },
    updateUser(parent, args, ctx, info) {
      //Find the user by their ID
      const user = users.find((user) => {
        return user.id === args.id;
      });

      //If user not found
      if (!user) {
        throw new Error("User not found");
      }

      //If the email is provided and already exists in another user, throw an error
      if (args.data.email) {
        const emailExists = users.some((user) => {
          return user.email === args.data.email && user.id !== args.id;
        });
        if (emailExists) {
          throw new Error("Email already in use by another user");
        }
      }

      //Update the fields if they are provided
      if (typeof args.data.name === "string") {
        user.name = args.data.name;
      }
      if (typeof args.data.email === "string") {
        user.email = args.data.email;
      }
      if (typeof args.data.age === "number") {
        user.age = args.data.age;
      }

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
    deleteOrder(parent, args, ctx, info) {
      //Validate if the order exists
      const orderIndex = orders.findIndex((order) => {
        return order.id === args.id;
      });

      //If order is not found
      if (orderIndex === -1) {
        throw new Error("Order not found");
      }

      //Remove the order
      const deletedOrder = orders.splice(orderIndex, 1); //An array

      return deletedOrder[0];
    },
    updateOrder(parent, args, ctx, info) {
      //Find the order by its ID
      const order = orders.find((order) => {
        return order.id === args.id;
      });

      //If the order is not found
      if (!order) {
        throw new Error("Order not found");
      }

      //Validate new user ID if provided
      if (args.data.userID) {
        const userExists = users.some((user) => {
          return user.id === args.data.userID;
        });
        if (!userExists) {
          throw new Error("Invalid user ID");
        }
      }

      //Validate new product ID if provided
      if (args.data.productID) {
        const productExists = products.some((product) => {
          return product.id === args.data.productID;
        });
        if (!productExists) {
          throw new Error("Invalid product ID");
        }
      }

      //Validate new company ID if provided
      if (args.data.companyID) {
        const companyExists = companies.some((company) => {
          return company.id === args.data.companyID;
        });
        if (!companyExists) {
          throw new Error("Invalid company ID");
        }
      }

      //Update the fields if provided
      if (typeof args.data.totalAmount === "number") {
        order.totalAmount = args.data.totalAmount;
      }
      if (typeof args.data.status === "string") {
        order.status = args.data.status;
      }
      if (typeof args.data.orderDate === "string") {
        order.orderDate = args.data.orderDate;
      }
      if (args.data.userID) {
        order.userID = args.data.userID;
      }
      if (args.data.productID) {
        order.productID = args.data.productID;
      }
      if (args.data.companyID) {
        order.companyID = args.data.companyID;
      }

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
    deleteReview(parent, args, ctx, info) {
      //Validate if the review exists
      const reviewIndex = reviews.findIndex((review) => {
        return review.id === args.id;
      });

      //If review not found
      if (reviewIndex === -1) {
        throw new Error("Review not found");
      }

      //Remove the review
      const deletedReview = reviews.splice(reviewIndex, 1); //An array

      //Clean up user's reviews
      users = users.map((user) => {
        return {
          ...user,
          reviews: user.reviews
            ? user.reviews.filter((review) => review.id !== args.id)
            : [],
        };
      });

      return deletedReview[0];
    },
    updateReview(parent, args, ctx, info) {
      //Find the review by its ID
      const review = reviews.find((review) => {
        return review.id === args.id;
      });

      //If review is not found
      if (!review) {
        throw new Error("Review not found");
      }

      //Validate the provided product ID (if any)
      if (args.data.productID) {
        const productExists = products.some((product) => {
          return product.id === args.data.productID;
        });
        if (!productExists) {
          throw new Error("Invalid product ID");
        }
      }

      //Validate the provided user ID (if any)
      if (args.data.userID) {
        const userExists = users.some((user) => {
          return user.id === args.data.userID;
        });
        if (!userExists) {
          throw new Error("Invalid user ID");
        }
      }

      //Update the fields if they are provided
      if (typeof args.data.rating === "number") {
        if (args.data.rating < 0 || args.data.rating > 5) {
          throw new Error("Rating must be between 0 and 5");
        }
        review.rating = args.data.rating;
      }
      if (typeof args.data.comment === "string") {
        review.comment = args.data.comment;
      }
      if (args.data.productID) {
        review.productID = args.data.productID;
      }
      if (args.data.userID) {
        review.userID = args.data.userID;
      }
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
    deleteCompany(parent, args, ctx, info) {
      //Validate if the company exists
      const companyIndex = companies.findIndex((company) => {
        return company.id === args.id;
      });

      //If company does not exist
      if (companyIndex === -1) {
        throw new Error("Company not found");
      }

      //Remove the company
      const deletedCompany = companies.splice(companyIndex, 1); //An array

      //Clean up related orders
      orders = orders.filter((order) => {
        return order.companyID !== args.id;
      });

      return deletedCompany[0];
    },
    updateCompany(parent, args, ctx, info) {
      //Find the company by its ID
      const company = companies.find((company) => {
        return company.id === args.id;
      });

      //If the company is not found
      if (!company) {
        throw new Error("Company not found");
      }

      //Validate the provided name (if any)
      if (args.data.name) {
        const nameExists = companies.some((company) => {
          return (
            company.name.toLowerCase() === args.data.name.toLowerCase() &&
            company.id !== args.id
          );
        });
        if (nameExists) {
          throw new Error("Company name already exists");
        }
      }

      //Update the fields if they are provided
      if (typeof args.data.name === "string") {
        company.name = args.data.name;
      }
      if (typeof args.data.location === "string") {
        company.location = args.data.location;
      }
      if (typeof args.data.industry === "string") {
        company.industry = args.data.industry;
      }

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
