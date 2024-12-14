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
  test("should return a token for valid login", async () => {
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

    console.log("Response Status Code:", response.statusCode);
    console.log("Response Body:", response.body);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("login.token");
  });
});
