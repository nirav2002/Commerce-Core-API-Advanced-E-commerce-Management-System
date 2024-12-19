# GraphQL Practice Project 🚀

The **GraphQL Practice Project** is a fully functional backend application showcasing the power of **GraphQL APIs**. The project features a robust implementation of **CRUD operations**, **real-time subscriptions**, and **role-based authentication**. The system supports multiple entities, enabling users to interact with products, categories, users, orders, reviews, and companies.

Built using **Node.js**, **Prisma**, and **PostgreSQL**, this project demonstrates best practices in backend development, including advanced testing with **Jest** and efficient database management with **Prisma ORM**.

<br>

## 🔍 Overview

This project demonstrates:

- **GraphQL APIs** for efficient and flexible data queries
- **Real-time subscriptions** to enable dynamic updates
- **Role-based authentication** to manage acccess securely

With a focus on backend best practices, the project offers a hands-on approach to building and managaing scalable systems.

<br>

## Key Features

1. **GraphQL API**:

   - Supports **CRUD operations** for six key entities:
     - Products, categories, Users, Orders, Reviews, and Companies
   - Efficient handling of relationships between entities

2. **Authentication and Authorization**:

   - **Role-based access control (RBAC)** ensures secure operations for **admin**and **user** roles
   - Secure API endpoints using **JWT tokens** for user authentication

3. **Real-Time Functionality**:

   - **Subscriptions** enable real-time updates for create, update, and delete events

4. **Comprehensive Testing**:

   - Integration tests are implemented using **Jest** and **Supertest**
   - Coverage includes scenarios for authentication, error handling, and edge cases

5. **Backend Best Practices**:

   - Clear separation of concerns with modularized folders and resolvers
   - Robust logging and error handling mechanisms

6. **Rate Limiting**:

   - Protects the API from abuse by limiting the number of requests a user/admin can make within a specific time frame

7. **Robust Logging**:

   - Comprehensive logging for debugging and monitoring purposes using a logging library
   - Tracks key events like authentication attempts, API requests, and errors

<br>

## Workflow

1. **Database Design and Setup**:

   - **Postgre SQL** serves as the relational database
   - Prisma ORM is used to define schemas for the six entities, manage migrations, and simplify database interactions

2. **API Development**:

   - **GraphQL** is used to create flexible, queryable APIs
   - Resolvers are designed for operations like queries, mutations, and subscriptions
   - Modular design separates concerns for better maintainability

3. **Authentication and Security**:

   - **JWT-based authentication** secures API endpoints
   - Role-based access ensures only admins can perform certain operations
   - Rate Limiting protects the API from abuse by restricting excessive requests

4. **Real-Time Subscriptions**:

   - A **Pub/Sub model** enables notifications for real-time data changes

5. **Logging & Testing**:

   - Logging feature provides detailed insights for monitoring and debugging
   - Integration tests validate API functionality and edge cases
   - **Jest** ensures reliability with automated testing for all resolvers

6. **Deployment**:

   - The project is designed ot be deployable on cloud platforms
   - Environment variables are managed securely using '.env' files

<br>

## Entities and Functionalities

1. **Products**:

   - Manage products with details like name, price, and stock availability
   - Relationships with categories, companies and orders

2. **Categories**:

   - Classify products into different categories

3. **Users**:

   - Role-based functionalities for **admin** and **user** roles
   - Secure user authentication and registration

4. **Orders**:

   - Manage user orders with relationships to products, companies, and users
   - Includes real-time subscription updates for order status changes

5. **Reviews**:

   - Allow users to review products and share feedback
   - Authorization ensures users can only modify their own reviews

6. **Companies**:

   - Manage company details and their association with products and orders

<br>
