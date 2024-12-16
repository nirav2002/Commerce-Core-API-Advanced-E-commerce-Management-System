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

//Create company
describe("GraphQL Company Functionality", () => {
  it("should throw an error when an unauthenticated user tries to create a company", async () => {
    const mutation = `
            mutation {
                createCompany(
                    data: {
                    name: "TechCorp",
                    location: "New York",
                    industry: "Technology"
                    }
                ) {
                    id
                    name
                    location
                    industry
                }
            }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a non-admin user tries to create a company", async () => {
    const userToken = jwt.sign(
      {
        id: "3",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    const mutation = `
        mutation {
            createCompany(
                data: {
                name: "TechCorp",
                location: "New York",
                industry: "Technology"
                }
            ) {
                id
                name
                location
                industry
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to create a company"
    );
  });

  it("should successfully create a company when an admin user makes the request", async () => {
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
            createCompany(
                data: {
                name: "TechCorp",
                location: "New York",
                industry: "Technology"
                }
            ) {
                id
                name
                location
                industry
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const company = response.body.data.createCompany;

    expect(company).toHaveProperty("id");
    expect(company).toHaveProperty("name", "TechCorp");
    expect(company).toHaveProperty("location", "New York");
    expect(company).toHaveProperty("industry", "Technology");
  });

  //Update Company

  it("should throw an error when an unauthenticated user tries to update a company", async () => {
    const mutation = `
        mutation {
            updateCompany(
                id: 6,
                data: {
                    location: "San Francisco"
                }
            ) {
                id
                name
                location
                industry
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a non-admin user tries to update a company", async () => {
    const userToken = jwt.sign(
      {
        id: "3",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateCompany(
                id: 6,
                data: {
                    location: "San Francisco"
                }
            ) {
                id
                name
                location
                industry
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to update a company"
    );
  });

  it("should throw an error when trying to update a non-existent company", async () => {
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
            updateCompany(
                id: 999,
                data: {
                    location: "San Francisco"
                }
            ) {
                id
                name
                location
                industry
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

  it("should successfully update a company when an admin makes the request", async () => {
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
            updateCompany(
                id: 6,
                data: {
                    location: "San Francisco"
                }
            ) {
                id
                name
                location
                industry
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const company = response.body.data.updateCompany;

    expect(company).toHaveProperty("id", "6");
    expect(company).toHaveProperty("name", "TechCorp");
    expect(company).toHaveProperty("location", "San Francisco");
  });

  //Delete Company

  it("should throw an error when an unauthenticated user tries to delete a company", async () => {
    const mutation = `
        mutation {
            deleteCompany(id: 6) {
                id
                name
                location
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a non-admin user tries to delete a company", async () => {
    const userToken = jwt.sign(
      {
        id: "3",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            deleteCompany(id: 6) {
                id
                name
                location
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to delete a company"
    );
  });

  it("should throw an error when trying to delete a non-existent company", async () => {
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
            deleteCompany(id: 999) {
                id
                name
                location
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

  it("should successfully delete a company when an admin makes the request", async () => {
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
            deleteCompany(id: 6) {
                id
                name
                location
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const company = response.body.data.deleteCompany;

    expect(company).toHaveProperty("id", "6");
    expect(company).toHaveProperty("name");
    expect(company).toHaveProperty("location");
  });
});
