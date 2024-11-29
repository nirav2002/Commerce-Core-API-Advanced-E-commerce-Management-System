//Demo products data
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

//Demo categories data
const categories = [
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

//Demo users data
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

//Demo orders data
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

//Demo reviews data
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

const db = {
  products,
  categories,
  users,
  orders,
  reviews,
  companies,
};

export { db as default };
