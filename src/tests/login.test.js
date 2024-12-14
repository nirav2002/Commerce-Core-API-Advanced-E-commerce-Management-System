// Updated login.test.js
const request = require("supertest");
const { startServer } = require("../index"); // Import the function to start the server
const { PrismaClient } = require("@prisma/client");

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

describe("GraphQL login functionality", () => {
  it("should return a token for valid login", async () => {
    const query = `
      mutation {
        login(email: "olivia.brown@test.com", password: "oliviabrown123") {
          token
        }
      }
    `;

    const response = await request("http://localhost:4000") // Use the correct base URL
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("login.token");
  });

  it("should return an error for invalid login credentials", async () => {
    const query = `
      mutation {
        login(email: "olivia.brown@test.com", password: "abc000") {
          token  
        }
      }
    `;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Invalid email or password");
  });

  it("should return an error for missing email", async () => {
    const query = `
      mutation {
        login(email: "", password: "abc000") {
          token
        }
      }
    `;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Email is required");
  });

  it("should return an error for missing password", async () => {
    const query = `
      mutation {
        login(email: "olivia.brown@test.com", password: "") {
          token
        }
      }
    `;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe("Password is required");
  });
});
