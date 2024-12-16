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

describe("GraphQL Product functionality", () => {
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

describe("GraphQL Category functionality", () => {
  it("should fetch all categories with their respective products", async () => {
    const query = `
        query {
            categories {
                id
                name
                description
                products {
                id
                name
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.data.categories).toHaveLength(5); //All categories are returned
    response.body.data.categories.forEach((category) => {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("description");
      expect(category).toHaveProperty("products");
      expect(Array.isArray(category.products)).toBe(true); // Products should be an array
    });
  });

  it("should return an empty array for categories without products", async () => {
    const query = `
        query {
            categories {
                name
                products {
                name
                }
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);

    const categoryWithoutProducts = response.body.data.categories.find(
      (category) => {
        return category.name === "Books";
      }
    );

    expect(categoryWithoutProducts.products).toEqual([]); //Books has no products
  });

  it("should validate specific category data", async () => {
    const query = `
        query {
            categories {
                id
                name
                description
            }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    const specificCategory = response.body.data.categories.find((category) => {
      return category.name === "Kitchen";
    });

    expect(specificCategory).toMatchObject({
      id: "4",
      name: "Kitchen",
      description: "Kitchen tools and supplies",
    });
  });
});

describe("GraphQL Users functionality", () => {
  it("should fetch all users without any filters (default pagination)", async () => {
    const query = `
        query {
            users {
                items {
                id
                name
                email
                age
                role
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
    expect(response.body.data.users.items).toHaveLength(5); //Default limit
    expect(response.body.data.users.prevPage).toBeNull();
    expect(response.body.data.users.nextPage).toBe(2);
  });

  it("should fetch users on page 2 with correct pagination", async () => {
    const query = `
        query {
            users(page: 2) {
                items {
                id
                name
                email
                age
                role
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
    expect(response.body.data.users.prevPage).toBe(1);
    expect(response.body.data.users.items.length).toBeGreaterThan(0);
  });

  it("should fetch users by name search (case insensitive)", async () => {
    const query = `
        query {
            users(search: "Sophia") {
                items {
                id
                name
                email
                age
                role
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
    const items = response.body.data.users.items;
    expect(items.length).toBeGreaterThan(0);
    items.forEach((user) => {
      expect(user.name.toLowerCase()).toContain("sophia");
    });
  });

  it("should return no users for unmatched filter criteria", async () => {
    const query = `
        query {
            users(search: "abc") {
                items {
                id
                name
                email
                age
                role
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
    expect(response.body.data.users.items).toHaveLength(0);
    expect(response.body.data.users.prevPage).toBeNull();
    expect(response.body.data.users.nextPage).toBeNull();
  });
});

describe("GraphQL Orders functionality", () => {
  it("should fetch all orders without filters", async () => {
    const query = `
            query {
                orders {
                    id
                    totalAmount
                    status
                    orderDate
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
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.data.orders).toBeDefined();
    expect(response.body.data.orders.length).toBeGreaterThan(0);

    const orders = response.body.data.orders;

    orders.forEach((order) => {
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("totalAmount");
      expect(order).toHaveProperty("status");
      expect(order).toHaveProperty("orderDate");
      expect(order).toHaveProperty("user");
      expect(order.user).toHaveProperty("id");
      expect(order.user).toHaveProperty("name");
      expect(order).toHaveProperty("product");
      expect(order.product).toHaveProperty("id");
      expect(order.product).toHaveProperty("name");
      expect(order).toHaveProperty("company");
      expect(order.company).toHaveProperty("id");
      expect(order.company).toHaveProperty("name");
    });
  });

  it("should verify relationships for all orders in the response", async () => {
    const query = `
            query {
                orders {
                    id
                    totalAmount
                    status
                    orderDate
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
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);

    const orders = response.body.data.orders;
    orders.forEach((order) => {
      expect(order.user.name).not.toBeNull();
      expect(order.product.name).not.toBeNull();
      expect(order.company.name).not.toBeNull();
    });
  });
});

describe("GraphQL Reviews functionality", () => {
  it("should fetch all reviews with product and user details", async () => {
    const query = `
                query {
                    reviews {
                        id
                        product {
                            id
                            name
                        }
                        user {
                            id
                            name
                        }
                        rating
                        comment
                    }
                }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    const reviews = response.body.data.reviews;

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThan(0);

    reviews.forEach((review) => {
      expect(review).toHaveProperty("id");
      expect(review).toHaveProperty("product");
      expect(review.product).toHaveProperty("id");
      expect(review.product).toHaveProperty("name");
      expect(review).toHaveProperty("user");
      expect(review.user).toHaveProperty("id");
      expect(review.user).toHaveProperty("name");
      expect(review).toHaveProperty("rating");
      expect(review).toHaveProperty("comment");
    });
  });

  it("should validate specific review details", async () => {
    const query = `
                query {
                    reviews {
                        id
                        product {
                            id
                            name
                        }
                        user {
                            id
                            name
                        }
                        rating
                        comment
                    }
                }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);

    const specificReview = response.body.data.reviews.find((review) => {
      return review.id === "1";
    });

    expect(specificReview).toMatchObject({
      id: "1",
      product: {
        id: "1",
        name: "Smartphone",
      },
      user: {
        id: "3",
        name: "Olivia Brown",
      },
      rating: 4.5,
      comment: "Amazing phone with great features!",
    });
  });
});

describe("GraphQL Company functionality", () => {
  it("should fetch all companies without filters", async () => {
    const query = `
        query {
          companies {
            id
            name
            location
            industry
          }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    const companies = response.body.data.companies;

    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);

    companies.forEach((company) => {
      expect(company).toHaveProperty("id");
      expect(company).toHaveProperty("name");
      expect(company).toHaveProperty("location");
      expect(company).toHaveProperty("industry");
    });
  });

  it("should validate specific company details", async () => {
    const query = `
        query {
          companies {
            id
            name
            location
            industry
          }
        }`;

    const response = await request("http://localhost:4000")
      .post("/")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);

    const specificCompany = response.body.data.companies.find((company) => {
      return company.id === "1";
    });

    expect(specificCompany).toMatchObject({
      id: "1",
      name: "InnoTech Ltd.",
      location: "San Francisco",
      industry: "Technology",
    });
  });
});
