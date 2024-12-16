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

describe("GraphQL User functionality", () => {
  it("should throw an error when a user that is not authenticated tries to create a user", async () => {
    const mutation = `
        mutation {
            createUser(
                data: {
                    name: "John Doe",
                    email: "john.doe@test.com",
                    age: 30,
                    role: "user",
                    password: "john123"
                }
            ) {
                id
                name
                email
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a user without admin role tries to create a user", async () => {
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
            createUser(
                data: {
                    name: "John Doe",
                    email: "john.doe@test.com",
                    age: 30,
                    role: "user",
                    password: "john123"
                }
            ) {
                id
                name
                email
                role
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to create a user"
    );
  });

  it("should throw a validation error when required fields are missing", async () => {
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
            createUser(
                data: {
                    name: "John Doe",
                    age: 30,
                    role: "user",
                    password: "john123"
                }
            ) {
                id
                name
                email
                role
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toContain(
      "Field 'email' is required"
    );
  });

  it("should successfully create a user when an admin creates it", async () => {
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
            createUser(
                data: {
                    name: "John Doe",
                    email: "john.doe@test.com",
                    age: 30,
                    role: "user",
                    password: "john123"
                }
            ) {
                id
                name
                email
                role
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const user = response.body.data.createUser;

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name", "John Doe");
    expect(user).toHaveProperty("email", "john.doe@test.com");
    expect(user).toHaveProperty("role", "user");
  });

  it("should throw an error when creating a user with an existing email", async () => {
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
            createUser(
                data: {
                    name: "John Doe",
                    email: "john.doe@test.com",
                    age: 30,
                    role: "user",
                    password: "john123"
                }
            ) {
                id
                name
                email
                age
                role
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Email already in use");
  });

  //Update user

  it("should throw an error when an unauthenticated user tries to update a user", async () => {
    const mutation = `
        mutation {
            updateUser(
                id: 11,
                data: { 
                    age: 31
                }
            ) {
                id
                name
                email
                age
                role
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a non-admin user tries to update another user's details", async () => {
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
          updateUser(
              id: 11,
              data: { 
                  age: 31
              }
          ) {
              id
              name
              email
              age
              role
          }
      }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to update this user"
    );
  });

  it("should allow a user to update their own details", async () => {
    const userToken = jwt.sign(
      {
        id: "11",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateUser(
                id: 11,
                data: { 
                    age: 31
                }
            ) {
                id
                name
                email
                age
                role
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    const user = response.body.data.updateUser;

    expect(user).toHaveProperty("id", "11");
    expect(user).toHaveProperty("name", "John Doe");
    expect(user).toHaveProperty("age", 31);
  });

  it("should allow an admin to update any user's details", async () => {
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
              updateUser(
                  id: 11,
                  data: { 
                      age: 30
                  }
              ) {
                  id
                  name
                  email
                  age
                  role
              }
          }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    const user = response.body.data.updateUser;

    expect(user).toHaveProperty("id", "11");
    expect(user).toHaveProperty("name", "John Doe");
    expect(user).toHaveProperty("role", "user");
  });

  it("should throw an error when the user to update does not exist", async () => {
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
              updateUser(
                  id: 999,
                  data: { 
                      age: 30
                  }
              ) {
                  id
                  name
                  email
                  age
                  role
              }
          }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("User not found");
  });

  //Delete User

  it("should throw an error when an unauthenticated user tries to delete a user", async () => {
    const mutation = `
        mutation {
            deleteUser(id: 11) {
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

  it("should throw an error when a non-admin user tries to delete another user", async () => {
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
            deleteUser(id: 11) {
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
      "You do not have permission to delete this user"
    );
  });

  it("should throw an error when the user to delete does not exist", async () => {
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
            deleteUser(id: 999) {
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
    expect(response.body.errors[0].message).toBe("User not found");
  });

  it("should allow an admin to successfully delete a user", async () => {
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
            deleteUser(id: 11) {
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
    const user = response.body.data.deleteUser;

    expect(user).toHaveProperty("id", "11");
    expect(user).toHaveProperty("name");
  });
});
