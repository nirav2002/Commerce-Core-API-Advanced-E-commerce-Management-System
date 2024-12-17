const request = require("supertest");
const { startServer } = require("../../index"); // Import the function to start the server
const { PrismaClient } = require("@prisma/client");
const { response } = require("express");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
let serverInstance;

beforeAll(async () => {
  await prisma.$connect();
  serverInstance = await startServer(4000); // Start the server on a test port
});

afterAll(async () => {
  await prisma.$disconnect();
  await new Promise((resolve) => serverInstance.close(resolve)); // Ensure the server closes cleanly
});

//Create Order
describe("GraphQL Order Functionality", () => {
  it("should throw an error when an unauthenticated user tries to create an order", async () => {
    const mutation = `
        mutation {
            createOrder(
                data: {
                    totalAmount: 1500.75,
                    status: "PENDING",
                    orderDate: "2024-04-12",
                    userID: 4,
                    productID: 1,
                    companyID: 1
                }
            ) {
                id
                totalAmount
                status
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a non-admin user tries to create an order", async () => {
    const userToken = jwt.sign(
      {
        id: "4",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            createOrder(
                data: {
                    totalAmount: 2000.99,
                    status: "PENDING",
                    orderDate: "2024-04-13",
                    userID: 5, # Different user
                    productID: 2,
                    companyID: 2
                }
            ) {
                id
                totalAmount
                status
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to create an order"
    );
  });

  it("should throw an error when the product ID does not exist", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            createOrder(
                data: {
                    totalAmount: 2500.25,
                    status: "SHIPPED",
                    orderDate: "2024-04-14",
                    userID: 4,
                    productID: 999, # Invalid product ID
                    companyID: 2
                }
            ) {
                id
                totalAmount
                status
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Product not found");
  });

  it("should throw an error when the company ID does not exist", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            createOrder(
                data: {
                    totalAmount: 4000.99,
                    status: "DELIVERED",
                    orderDate: "2024-04-16",
                    userID: 4,
                    productID: 3,
                    companyID: 999
                }
            ) {
                id
                totalAmount
                status
                user {
                    id
                    name
                }
                product {
                    id
                    name
                }
                company {
                    id
                    name
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Company not found");
  });

  it("should successfully create an order when an admin user makes the request", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            createOrder(
                data: {
                    totalAmount: 4000.99,
                    status: "DELIVERED",
                    orderDate: "2024-04-16",
                    userID: 4,
                    productID: 3,
                    companyID: 1
                }
            ) {
                id
                totalAmount
                status
                user {
                    id
                    name
                }
                product {
                    id
                    name
                }
                company {
                    id
                    name
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    console.log("Response:", JSON.stringify(response.body)); // Debug response

    expect(response.statusCode).toBe(200);
    const order = response.body.data.createOrder;

    expect(order).toHaveProperty("id");
    expect(order).toHaveProperty("totalAmount", 4000.99);
    expect(order).toHaveProperty("status", "DELIVERED");
    expect(order.user).toHaveProperty("id", "4");
    expect(order.product).toHaveProperty("id", "3");
    expect(order.company).toHaveProperty("id", "1");
  });

  //Update Order

  it("should throw an error when an unauthenticated user tries to update an order", async () => {
    const mutation = `
        mutation {
            updateOrder(
                id: 11,
                data: { totalAmount: 4500.75, status: "SHIPPED" }
            ) {
                id
                totalAmount
                status
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a non-admin user tries to update an order", async () => {
    const userToken = jwt.sign(
      {
        id: "4",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateOrder(
                id: 11,
                data: { totalAmount: 4500.75, status: "SHIPPED" }
            ) {
                id
                totalAmount
                status
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to update this order"
    );
  });

  it("should throw an error when trying to update a non-existent order", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateOrder(
                id: 999,
                data: { totalAmount: 4500.75, status: "SHIPPED" }
            ) {
                id
                totalAmount
                status
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Order not found");
  });

  it("should throw an error when trying to update with a non-existent product ID", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateOrder(
                id: 11,
                data: { productID: 999 }
            ) {
                id
                product {
                id
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Product not found");
  });

  it("should throw an error when trying to update with an non-existent company ID", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateOrder(
                id: 11,
                data: { companyID: 999 }
                ) {
                id
                company {
                    id
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Company not found");
  });

  it("should successfully update an order when an admin user makes the request", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateOrder(
                id: 11,
                data: {
                    totalAmount: 5000.99,
                    status: "DELIVERED",
                    orderDate: "2024-04-20"
                }
            ) {
                id
                totalAmount
                status
                orderDate
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const updatedOrder = response.body.data.updateOrder;

    expect(updatedOrder).toHaveProperty("id", "11");
    expect(updatedOrder).toHaveProperty("totalAmount", 5000.99);
    expect(updatedOrder).toHaveProperty("status", "DELIVERED");
    expect(updatedOrder).toHaveProperty("orderDate", "2024-04-20");
  });

  it("should throw an error when an unauthenticated user tries to delete an order", async () => {
    const mutation = `
        mutation {
            deleteOrder(id: 11) {
                id
            }
        }
    `;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a non-admin user tries to delete an order", async () => {
    const userToken = jwt.sign(
      {
        id: "4",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            deleteOrder(id: 11) {
                id
            }
        }
    `;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to delete this order"
    );
  });

  it("should throw an error when trying to delete a non-existent order", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            deleteOrder(id: 999) {
                id
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Order not found");
  });

  it("should successfully delete an order when an admin user makes the request", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            deleteOrder(id: 11) {
                id
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const deletedOrder = response.body.data.deleteOrder;

    expect(deletedOrder).toHaveProperty("id", "11");
  });
});
