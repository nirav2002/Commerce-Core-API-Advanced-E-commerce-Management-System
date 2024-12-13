const bcrypt = require("bcrypt"); // For password encryption
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const chalk = require("chalk"); // For colorful console messages

// Load environment variables
dotenv.config();

// Use the test database URL explicitly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_TEST_URL, // Explicitly use the test database URL
    },
  },
});

// Users data
const users = [
  {
    name: "Sophia Carter",
    email: "sophia.carter@test.com",
    password: "sophiacarter123",
    age: 42,
    role: "admin",
  },
  {
    name: "James Anderson",
    email: "james.anderson@test.com",
    password: "jamesanderson123",
    age: 39,
    role: "admin",
  },
  {
    name: "Olivia Brown",
    email: "olivia.brown@test.com",
    password: "oliviabrown123",
    age: 28,
    role: "user",
  },
  {
    name: "Liam Taylor",
    email: "liam.taylor@test.com",
    password: "liamtaylor123",
    age: 30,
    role: "user",
  },
  {
    name: "Mia Martinez",
    email: "mia.martinez@test.com",
    password: "miamartinez123",
    age: 24,
    role: "user",
  },
  {
    name: "Noah Wilson",
    email: "noah.wilson@test.com",
    password: "noahwilson123",
    age: 35,
    role: "user",
  },
  {
    name: "Ava Davis",
    email: "ava.davis@test.com",
    password: "avadavis123",
    age: 26,
    role: "user",
  },
  {
    name: "Elijah Miller",
    email: "elijah.miller@test.com",
    password: "elijahmiller123",
    age: 31,
    role: "user",
  },
  {
    name: "Emma Garcia",
    email: "emma.garcia@test.com",
    password: "emmagarcia123",
    age: 27,
    role: "user",
  },
  {
    name: "Lucas Lee",
    email: "lucas.lee@test.com",
    password: "lucaslee123",
    age: 29,
    role: "user",
  },
];

const companies = [
  {
    name: "InnoTech Ltd.",
    location: "San Francisco",
    industry: "Technology",
  },
  {
    name: "HealthHub",
    location: "Austin",
    industry: "Healthcare",
  },
  {
    name: "EcoFurnish",
    location: "Chicago",
    industry: "Furniture",
  },
  {
    name: "FitLife Gear",
    location: "Seattle",
    industry: "Fitness",
  },
  {
    name: "KitchenWares Co.",
    location: "New York",
    industry: "Kitchen Supplies",
  },
];

// Categories data
const categories = [
  {
    name: "Electronics",
    description: "Devices and gadgets",
  },
  {
    name: "Fitness",
    description: "Gear for staying fit",
  },
  {
    name: "Furniture",
    description: "Furniture for home or office",
  },
  {
    name: "Kitchen",
    description: "Kitchen tools and supplies",
  },
  {
    name: "Books",
    description: "Books for all ages",
  },
];

// Products data
const products = [
  {
    name: "Smartphone",
    price: 999.99,
    inStock: true,
    categoryID: 1,
  },
  {
    name: "Yoga Mat",
    price: 24.99,
    inStock: true,
    categoryID: 2,
  },
  {
    name: "Office Chair",
    price: 149.99,
    inStock: true,
    categoryID: 3,
  },
  {
    name: "Blender",
    price: 49.99,
    inStock: true,
    categoryID: 4,
  },
  {
    name: "Wireless Headphones",
    price: 199.99,
    inStock: true,
    categoryID: 1,
  },
  {
    name: "Dumbbells Set",
    price: 59.99,
    inStock: true,
    categoryID: 2,
  },
  {
    name: "Bookshelf",
    price: 129.99,
    inStock: true,
    categoryID: 3,
  },
  {
    name: "Cookware Set",
    price: 89.99,
    inStock: true,
    categoryID: 4,
  },
];

// Orders data
const orders = [
  {
    totalAmount: 999.99,
    status: "Delivered",
    orderDate: "2024-12-01",
    userID: 3,
    productID: 1,
    companyID: 1,
  },
  {
    totalAmount: 24.99,
    status: "Shipped",
    orderDate: "2024-12-02",
    userID: 4,
    productID: 2,
    companyID: 4,
  },
  {
    totalAmount: 149.99,
    status: "Processing",
    orderDate: "2024-12-03",
    userID: 5,
    productID: 3,
    companyID: 3,
  },
  {
    totalAmount: 49.99,
    status: "Delivered",
    orderDate: "2024-12-04",
    userID: 6,
    productID: 4,
    companyID: 5,
  },
  {
    totalAmount: 199.99,
    status: "Shipped",
    orderDate: "2024-12-05",
    userID: 7,
    productID: 5,
    companyID: 1,
  },
  {
    totalAmount: 59.99,
    status: "Delivered",
    orderDate: "2024-12-06",
    userID: 8,
    productID: 6,
    companyID: 4,
  },
  {
    totalAmount: 129.99,
    status: "Cancelled",
    orderDate: "2024-12-07",
    userID: 9,
    productID: 7,
    companyID: 3,
  },
];

// Reviews data
const reviews = [
  {
    productID: 1,
    userID: 3,
    rating: 4.5,
    comment: "Amazing phone with great features!",
  },
  {
    productID: 2,
    userID: 4,
    rating: 5.0,
    comment: "Perfect mat for my daily yoga sessions!",
  },
  {
    productID: 3,
    userID: 5,
    rating: 4.0,
    comment: "Comfortable and worth the price.",
  },
  {
    productID: 4,
    userID: 6,
    rating: 3.5,
    comment: "Blends well but a bit noisy.",
  },
  {
    productID: 5,
    userID: 7,
    rating: 4.8,
    comment: "Great sound quality and battery life!",
  },
];

const importData = async () => {
  try {
    console.log(chalk.cyan("Seeding data into the test database..."));

    // Seed users
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({ data: { ...user, password: hashedPassword } });
    }

    // Seed companies
    for (const company of companies) {
      await prisma.company.create({ data: company });
    }

    // Seed categories
    for (const category of categories) {
      await prisma.category.create({ data: category });
    }

    // Seed products
    for (const product of products) {
      const category = await prisma.category.findUnique({
        where: { name: categories[product.categoryID - 1].name }, // Match category by name
      });

      if (!category) {
        throw new Error(
          `Category with name ${
            categories[product.categoryID - 1].name
          } not found.`
        );
      }

      await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          inStock: product.inStock,
          category: {
            connect: { id: category.id }, // Use dynamically fetched category ID
          },
        },
      });
    }

    // Seed orders
    for (const order of orders) {
      const user = await prisma.user.findUnique({
        where: { email: users[order.userID - 1].email }, // Fetch user by email
      });

      const product = await prisma.product.findFirst({
        where: { name: products[order.productID - 1].name }, // Fetch product by name
      });

      const company = await prisma.company.findUnique({
        where: { name: companies[order.companyID - 1].name }, // Fetch company by name
      });

      if (!user || !product || !company) {
        throw new Error(
          `Invalid order data: User, Product, or Company not found for order with totalAmount ${order.totalAmount}.`
        );
      }

      await prisma.order.create({
        data: {
          totalAmount: order.totalAmount,
          status: order.status,
          orderDate: order.orderDate,
          user: { connect: { id: user.id } },
          product: { connect: { id: product.id } },
          company: { connect: { id: company.id } },
        },
      });
    }

    // Seed reviews
    for (const review of reviews) {
      const user = await prisma.user.findUnique({
        where: { id: review.userID },
      });

      const product = await prisma.product.findFirst({
        where: { id: review.productID },
      });

      if (!user || !product) {
        throw new Error(
          `Invalid review data: User or Product not found for review with rating ${review.rating}.`
        );
      }

      await prisma.review.create({
        data: {
          rating: review.rating,
          comment: review.comment,
          user: { connect: { id: user.id } },
          product: { connect: { id: product.id } },
        },
      });
    }

    console.log(
      chalk.green("Data successfully seeded into the test database!")
    );
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error seeding data:", error.message));
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    console.log(chalk.cyan("Deleting all data from the test database..."));

    await prisma.review.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();

    console.log(
      chalk.red("All data successfully deleted from the test database!")
    );
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error deleting data:", error.message));
    process.exit(1);
  }
};

const main = async () => {
  if (process.argv[2] === "-i") {
    await importData();
  } else if (process.argv[2] === "-d") {
    await deleteData();
  } else {
    console.log(
      chalk.blue('Please use "-i" to import data or "-d" to delete data.')
    );
    process.exit(0);
  }
};

main();
