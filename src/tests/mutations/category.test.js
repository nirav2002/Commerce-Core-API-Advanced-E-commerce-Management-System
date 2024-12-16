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

describe("GraphQL Category functionality", () => {
  it("should throw an error when a user that is not authorized tries to create a category", async () => {
    const mutation = `
            mutation {
                createCategory(
                    data: {
                        name: "Home Decor",
                        description: "Products for home"
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

  it("should throw an error when a user without admin role tries to create a category", async () => {
    const userToken = jwt.sign(
      {
        id: "3",
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            createCategory(
                data: {
                    name: "Home Decor",
                    description: "Products for home"
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
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to create a category"
    );
  });

  it("should successfully create a category when user is an admin", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            createCategory(
                data: {
                    name: "Home Decor",
                    description: "Products for home"
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
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const category = response.body.data.createCategory;

    expect(category).toHaveProperty("id");
    expect(category).toHaveProperty("name", "Home Decor");
  });

  //Update Category tests

  it("should throw an error when a user that is not authenticated tries to update a category", async () => {
    const mutation = `
        mutation {
            updateCategory(
                id: 6,
                data: { 
                    name: "Home Decor",
                    description: "Best products for home"
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
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a user without admin role tries to update a category", async () => {
    const userToken = jwt.sign(
      {
        id: "3",
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            updateCategory(
                id: 6,
                data: { 
                    name: "Home Decor",
                    description: "Best products for home"
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
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to update a category"
    );
  });

  it("should throw an error when the category does not exist", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            updateCategory(
                id: 999,
                data: { 
                    name: "Home Decor",
                    description: "Best products for home"
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
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Category not found");
  });

  it("should successfully update a category when user is an admin", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            updateCategory(
                id: 6,
                data: { 
                    name: "Home Decor",
                    description: "Best products for home"
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
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const category = response.body.data.updateCategory;

    expect(category).toHaveProperty("id", "6");
    expect(category).toHaveProperty("name", "Home Decor");
  });

  //Delete Category tests

  it("should throw an error when a user that is not authenticated tries to delete a category", async () => {
    const mutation = `
        mutation {
            deleteCategory(id: 6) {
                id
                name
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a user without admin role tries to delete a category", async () => {
    const userToken = jwt.sign(
      {
        id: "3",
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            deleteCategory(id: 6) {
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
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to delete a category"
    );
  });

  it("should throw an error when the category does not exist", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            deleteCategory(id: 999) {
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
    expect(response.body.errors[0].message).toBe("Category not found");
  });

  it("should successfully delete a category when user is an admin", async () => {
    const adminToken = jwt.sign(
      {
        id: "1",
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const mutation = `
        mutation {
            deleteCategory(id: 6) {
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
    const category = response.body.data.deleteCategory;

    expect(category).toHaveProperty("id", "6");
    expect(category).toHaveProperty("name");
  });
});
