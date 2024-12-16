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

describe("GraphQL Product functionality", () => {
  //Create Product

  it("should throw an error when a user that is not authenticated tries to create a product", async () => {
    const mutation = `
        mutation {
            createProduct(
                data: {
                    name: "Laptop",
                    price: 1499.99,
                    inStock: true,
                    categoryID: 1
                }
            ) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when user is not an admin", async () => {
    //Generate a valid user token
    const userToken = jwt.sign(
      {
        id: "2",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            createProduct(
                data: {
                    name: "Laptop",
                    price: 1499.99,
                    inStock: true,
                    categoryID: 1
                }
            ) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to create a product"
    );
  });

  it("should throw an error when category does not exist", async () => {
    // Generate a valid admin token
    const adminToken = jwt.sign(
      { id: "1", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    const mutation = `
        mutation {
            createProduct(
                data: {
                    name: "Laptop",
                    price: 1499.99,
                    inStock: true,
                    categoryID: 999
                }
            ) {
                id
                name
                price
                inStock
                category {
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
    expect(response.body.errors[0].message).toBe("Category not found");
  });

  it("should successfully create a product when user is an admin", async () => {
    //Generate a valid admin token
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
            createProduct(
                data: {
                    name: "Laptop",
                    price: 1499.99,
                    inStock: true,
                    categoryID: 1
                }
            ) {
                id
                name
                price
                inStock
                category {
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
    const product = response.body.data.createProduct;

    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name", "Laptop");
    expect(product).toHaveProperty("price", 1499.99);
    expect(product).toHaveProperty("inStock", true);
    expect(product.category).toHaveProperty("id");
    expect(product.category).toHaveProperty("name");
  });

  //Update Product

  it("should throw an error when a user that is not authenticated tries to update a product", async () => {
    const mutation = `
        mutation {
            updateProduct(
                id: 9,
                data: {
                name: "Unauthorized Update",
                price: 1100.00
                }
            ) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a person who is not an admin tries to update the product", async () => {
    //Generate a valid user token
    const userToken = jwt.sign(
      {
        id: "2",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateProduct(
                id: 9,
                data: {
                name: "Laptop",
                price: 1299.99,
                inStock: false
                }
            ) {
                id
                name
                price
                inStock
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to update a product"
    );
  });

  it("should throw an error when product does not exist", async () => {
    //Generate a valid admin token
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
            updateProduct(
                id: 12,
                data: {
                name: "Sofa",
                price: 2299.99,
                inStock: true
                }
            ) {
                id
                name
                price
                inStock
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Product not found");
  });

  it("should successfully update a product when user is an admin", async () => {
    //Generate a valid admin token
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
            updateProduct(
                id: 9,
                data: {
                name: "Laptop",
                price: 1299.99,
                inStock: false
                }
            ) {
                id
                name
                price
                inStock
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const product = response.body.data.updateProduct;

    expect(product).toHaveProperty("id", "9");
    expect(product).toHaveProperty("name", "Laptop");
    expect(product).toHaveProperty("price", 1299.99);
    expect(product).toHaveProperty("inStock", false);
  });

  //Delete Product

  it("should throw an error when user is not authenticated for deleting a product", async () => {
    const mutation = `
        mutation {
        deleteProduct(id:9) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when user is not an admin for deleting a product", async () => {
    //Generate a valid user token
    const userToken = jwt.sign(
      {
        id: "2",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            deleteProduct(id: 9) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to delete a product"
    );
  });

  it("should throw an error when the product does not exist for deletion", async () => {
    //Generate a valid adin token
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
            deleteProduct(id: 999) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Product not found");
  });

  it("should successfully delete a product when user is an admin", async () => {
    //Generate a valid adin token
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
            deleteProduct(id: 9) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const product = response.body.data.deleteProduct;

    expect(product).toHaveProperty("id", "9");
    expect(product).toHaveProperty("name");
  });
});
