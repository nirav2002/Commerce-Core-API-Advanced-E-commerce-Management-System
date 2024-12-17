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

describe("GraphQL Review Functionality", () => {
  it("should throw an error when an unauthenticated user tries to create a review", async () => {
    const mutation = `
        mutation {
            createReview(
                data: {
                    rating: 4,
                    comment: "Excellent Product! Highly recommended",
                    productID: 5,
                    userID: 4
                }
            ) {
                id
                rating
                comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when an admin user tries to create a review", async () => {
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
            createReview(
                data: {
                    rating: 4,
                    comment: "Excellent Product! Highly recommended",
                    productID: 1,
                    userID: 1
                }
            ) {
                id
                rating
                comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to create a review"
    );
  });

  it("should throw an error when the product ID is invalid", async () => {
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
            createReview(
                data: {
                    rating: 4,
                    comment: "Excellent Product! Highly recommended",
                    productID: 999,
                    userID: 1
                }
            ) {
                id
                rating
                comment
                product {
                    id
                }
                user {
                    id
                    name
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Product not found");
  });

  it("should throw an error when the user has already reviewed the product", async () => {
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
            createReview(
                data: {
                    rating: 4,
                    comment: "Excellent Product! Highly recommended",
                    productID: 1,
                    userID: 3
                }
            ) {
                id
                rating
                comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You have already reviewed this product"
    );
  });

  it("should successfully create a review for a product that the user has not reviewed yet", async () => {
    const userToken = jwt.sign(
      {
        id: 4,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            createReview(
                data: {
                    rating: 4,
                    comment: "Excellent Product! Highly recommended",
                    productID: 5,
                    userID: 4
                }
            ) {
                id
                rating
                comment
                product {
                    id
                }
                user {
                    id
                    name
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    //expect(response.statusCode).toBe(200);
    const review = response.body.data.createReview;

    expect(review).toHaveProperty("id");
    expect(review).toHaveProperty("rating", 4);
    expect(review).toHaveProperty(
      "comment",
      "Excellent Product! Highly recommended"
    );
    expect(review.product).toHaveProperty("id", "5");
    expect(review.user).toHaveProperty("id", "4");
  });

  //Update Review

  it("should throw an error when an unauthenticated user tries to update a review", async () => {
    const mutation = `
        mutation {
            updateReview(
                id: 13,
                data: {
                    rating: 5,
                    comment: "Amazing Product! A must-have"
                }
            ) {
                id
                rating
                comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when an admin user tries to update a review", async () => {
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
            updateReview(
                id: 13,
                data: {
                    rating: 5,
                    comment: "Amazing Product! A must-have"
                }
            ) {
                id
                rating
                comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to update this review"
    );
  });

  it("should throw an error when a user tries to update someone else's review", async () => {
    const userToken = jwt.sign(
      {
        id: "5",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateReview(
                id: 13,
                data: {
                    rating: 5,
                    comment: "Amazing Product! A must-have"
                }
            ) {
                id
                rating
                comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to update this review"
    );
  });

  it("should successfully update a review when the user owns the review", async () => {
    const userToken = jwt.sign(
      {
        id: 4,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            updateReview(
                id: 13,
                data: {
                    rating: 5,
                    comment: "Amazing Product! A must-have"
                }
            ) {
                id
                rating
                comment
                user {
                    id
                    name
                }
                product {
                    id
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    const review = response.body.data.updateReview;

    expect(review).toHaveProperty("id", "13");
    expect(review).toHaveProperty("rating", 5);
    expect(review).toHaveProperty("comment", "Amazing Product! A must-have");
    expect(review.user).toHaveProperty("id", "4");
    expect(review.user).toHaveProperty("name", "Liam Taylor");
    expect(review.product).toHaveProperty("id", "5");
  });

  //Delte Review

  it("should throw an error when an unauthenticated user tries to delete a review", async () => {
    const mutation = `
        mutation {
            deleteReview(id: 13) {
            id
            rating
            comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Authentication required");
  });

  it("should throw an error when a user tries to delete someone else's review", async () => {
    const userToken = jwt.sign(
      {
        id: "5",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            deleteReview(id: 13) {
            id
            rating
            comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have permission to delete this review"
    );
  });

  it("should successfully delete the user's own review", async () => {
    const userToken = jwt.sign(
      {
        id: 4,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const mutation = `
        mutation {
            deleteReview(id: 13) {
                id
                rating
                comment
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query: mutation })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    const deletedReview = response.body.data.deleteReview;

    expect(deletedReview).toHaveProperty("id", "13");
    expect(deletedReview).toHaveProperty("rating");
    expect(deletedReview).toHaveProperty("comment");
  });
});
