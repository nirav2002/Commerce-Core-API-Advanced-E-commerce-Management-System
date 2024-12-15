const request = require("supertest");
const { startServer } = require("../index"); // Import the function to start the server
const { PrismaClient } = require("@prisma/client");
const { response } = require("express");

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

describe("GraphQL query functionality", () => {
  it("should fetch all products without any filters (default pagination)", async () => {
    const query = `
        query {
            products{
                items {
                    id
                    name
                    price
                    inStock
                }
                prevPage
                nextPage
            }
        }
    `;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.data.products.items).toHaveLength(5); //Default
    expect(response.body.data.products.prevPage).toBeNull();
    expect(response.body.data.products.nextPage).toBe(2); //Check next page
  });

  it("should fetch products on page 2 with correct pagination", async () => {
    const query = `
        query {
            products (page: 2) {
                items {
                    id
                    name
                    price
                    inStock
                }
                prevPage
                nextPage
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.data.products.prevPage).toBe(1);
  });

  it("should fetch products within a price range", async () => {
    const query = `
        query {
            products(minPrice: 50, maxPrice: 200) {
                items {
                    id
                    name
                    price
                    inStock
                }
                prevPage
                nextPage
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    response.body.data.products.items.forEach((product) => {
      expect(product.price).toBeGreaterThanOrEqual(50);
      expect(product.price).toBeLessThanOrEqual(200);
    });
    expect(response.body.data.products.prevPage).toBeNull();
    expect(response.body.data.products.nextPage).toBeNull();
  });

  it("should fetch products by name search (case insensitive)", async () => {
    const query = `
        query {
            products(search: "Smart") {
                items {
                id
                name
                price
                inStock
                }
                prevPage
                nextPage
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);

    const items = response.body.data.products.items;

    expect(items.length).toBeGreaterThan(0);
    items.forEach((product) => {
      expect(product.name.toLowerCase()).toContain("smart");
    });

    if (items.length === 5) {
      //Only check for next page if the pagination limit is reached
      expect(response.body.data.products.nextPage).not.toBeNull();
    } else {
      //Otherwise, next page should be null
      expect(response.body.data.products.nextPage).toBeNull();
    }
  });

  it("should return no products for unmatched filter criteria", async () => {
    const query = `
        query {
            products(minPrice: 1000) {
                items {
                id
                name
                price
                inStock
                }
                prevPage
                nextPage
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.data.products.items).toHaveLength(0); //No products
    expect(response.body.data.products.prevPage).toBeNull();
    expect(response.body.data.products.nextPage).toBeNull();
  });
});
