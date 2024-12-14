require("dotenv").config({ path: "./.env" });
process.env.DATABASE_URL = process.env.DATABASE_TEST_URL; // Use the test database for Jest
