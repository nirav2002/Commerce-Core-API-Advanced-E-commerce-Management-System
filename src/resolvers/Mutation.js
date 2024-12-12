import { verifyToken } from "../utils/auth";

const Mutation = {
  async login(parent, args, { prisma, bcrypt, jwt, logger }, info) {
    //Log the start of the login process
    logger.info("Starting login process...");

    try {
      //Fetch the user by email
      const user = await prisma.user.findUnique({
        where: {
          email: args.email,
        },
      });

      //If user does not exist
      if (!user) {
        logger.warn(`Login failed: Invalid email - ${args.email}`);
        throw new Error("Invalid email or password");
      }

      //Verify the password
      const isPasswordValid = await bcrypt.compare(
        args.password,
        user.password
      );
      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password for email - ${args.email}`);
        throw new Error("Invalid email or password");
      }

      //Generate a JWT
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET, //Secret key for signing
        {
          expiresIn: "2h",
        }
      );

      //Log successful login
      logger.info(
        `User logged in successfully: ID - ${user.id}, Role - ${user.role}`
      );

      return { token };
    } catch (error) {
      logger.error(`Error in login process: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async createProduct(parent, args, { prisma, pubsub, request, logger }, info) {
    //Log the start of the procss
    logger.info("Starting product creation process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can create a product
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to create a product by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to create a product");
      }

      //Validate that the categoryID exists using Prisma
      const categoryID = parseInt(args.data.categoryID, 10);

      const categoryExists = await prisma.category.findUnique({
        where: {
          id: categoryID, //CategoryID is integer
        },
      });

      //If category does not exist
      if (!categoryExists) {
        logger.warn(
          `Failed attempt to create product. Category with ID ${categoryID} not found`
        );
        throw new Error("Category not found");
      }

      //Create the product using Prisma
      const product = await prisma.product.create({
        data: {
          name: args.data.name,
          price: args.data.price,
          inStock: args.data.inStock,
          category: {
            connect: {
              id: categoryID,
            },
          },
        },
      });

      //Log successful creation
      logger.info(
        `Product created successfully by Admin ${user.id}. New product: ${product.name} (Category ID: ${categoryID})`
      );

      //Publish the product creation to the pubsub model
      pubsub.publish("productChannel", {
        product: {
          mutation: "CREATED",
          data: product,
        },
      });

      return product;
    } catch (error) {
      logger.error(`Error in createProduct Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async deleteProduct(parent, args, { prisma, pubsub, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting product deletion process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can delete a product
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to delete a product by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to delete a product");
      }

      //Ensure that id is an integer
      const productId = parseInt(args.id, 10);

      //Validate if the product exists using Prisma
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      //If product does not exist
      if (!product) {
        logger.warn(`Product with ID ${productId} not found`);
        throw new Error("Product not found");
      }

      //Delete the product using Prisma
      const deletedProduct = await prisma.product.delete({
        where: {
          id: productId,
        },
      });

      //Log successful deletion
      logger.info(
        `Product with ID ${productId} deleted successfully by Admin ${user.id}`
      );

      //Remove all orders associated with the product
      await prisma.order.deleteMany({
        where: {
          productId: productId, //Ensuring productId is an integer
        },
      });

      //Remove all reviews associated with the product
      await prisma.review.deleteMany({
        where: {
          productId: productId,
        },
      });

      //Publish the deleted product to pubsub model
      pubsub.publish("productChannel", {
        product: {
          mutation: "DELETED",
          data: deletedProduct,
        },
      });

      return deletedProduct;
    } catch (error) {
      logger.error(`Error in deleteProduct Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async updateProduct(parent, args, { prisma, pubsub, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting product update process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can update a product
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to update a product by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to update a product");
      }

      //Convert the id to an integer
      const productId = parseInt(args.id, 10);

      //Check if the product exists using Prisma
      const product = await prisma.product.findUnique({
        where: {
          id: productId, //Use the integer productId
        },
      });

      //If product does not exist
      if (!product) {
        logger.warn(`Product with ID ${productId} not found`);
        throw new Error("Product not found");
      }

      //If categoryId is provided with args.data for updation, validate it exists using Prisma
      if (args.data.categoryId) {
        //Convert categoryId to an integer
        const categoryId = parseInt(args.data.categoryId, 10);

        const categoryExists = await prisma.category.findUnique({
          where: {
            id: categoryId, //Use the integer categoryId
          },
        });

        //If category does not exist
        if (!categoryExists) {
          logger.warn(`Invalid category ID provided: ${categoryId}`);
          throw new Error("Invalid category ID");
        }
      }

      //Update the product using Prisma
      const updatedProduct = await prisma.product.update({
        where: {
          id: productId, //Use the integer productId
        },
        data: args.data,
      });

      //Log successful update
      logger.info(
        `Product with ID ${productId} updated successfully by Admin ${
          user.id
        }. Updated fields: ${Object.keys(args.data).join(", ")}`
      );

      //Publish the updated product to the pubsub model
      pubsub.publish("productChannel", {
        product: {
          mutation: "UPDATED",
          data: updatedProduct,
        },
      });

      return updatedProduct;
    } catch (error) {
      logger.error(`Error in updateProduct Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async createCategory(
    parent,
    args,
    { prisma, pubsub, request, logger },
    info
  ) {
    //Log the start of the process
    logger.info("Starting category creation process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can create a category
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to create a category by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to create a category");
      }

      const productIDs = args.data.products || []; // Default to empty array if not provided

      // Validate if the product IDs provided exist in the products
      const productExists = await Promise.all(
        productIDs.map(async (productID) => {
          const product = await prisma.product.findUnique({
            where: { id: productID },
          });
          return product ? null : `Invalid Product ID: ${productID}`;
        })
      );

      // Filter out any invalid product IDs
      const invalidProducts = productExists.filter((result) => result !== null);

      // If there are invalid product IDs, throw an error
      if (invalidProducts.length > 0) {
        throw new Error(invalidProducts.join(", "));
      }

      // Check if the category name already exists
      const categoryExists = await prisma.category.findUnique({
        where: { name: args.data.name },
      });

      // If category name already exists, throw an error
      if (categoryExists) {
        logger.warn(
          `Failed attempt to create category. Category name ${args.data.name} already exists`
        );
        throw new Error(`Category name ${args.data.name} already exists`);
      }

      // Create the new category using Prisma (ID will be auto-generated by PostgreSQL)
      const category = await prisma.category.create({
        data: {
          ...args.data,
          products: {
            connect: productIDs.map((id) => ({ id })),
          },
        },
      });

      //Log successful creation
      logger.info(
        `Category created successfully by Admin ${user.id}. New category: ${category.name}`
      );

      return category;
    } catch (error) {
      logger.error(`Error in createCategory Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async deleteCategory(
    parent,
    args,
    { prisma, pubsub, request, logger },
    info
  ) {
    //Log the start of the process
    logger.info("Starting category deletion process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication rquired. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can delete a category
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to delete a category by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to delete a category");
      }

      //Converting categoryId to an integer
      const categoryId = parseInt(args.id, 10);

      //Validate if the category exists using Prisma
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId, //Use the integer categoryId
        },
      });

      //If category not found
      if (!category) {
        logger.warn(`Category with ID ${categoryId} not found`);
        throw new Error("Category not found");
      }

      //Delete the category using Prisma
      const deletedCategory = await prisma.category.delete({
        where: {
          id: categoryId, //Use the integer categoryId
        },
      });

      //Log successful deletion
      logger.info(
        `Category with ID ${categoryId} deleted successfully by Admin ${user.id}`
      );

      //Find and remove all products linked to the category
      await prisma.product.deleteMany({
        where: {
          categoryID: categoryId, //Use the integer categoryId
        },
      });

      //Remove all orders and reviews associated with the deleted products
      await prisma.order.deleteMany({
        where: {
          productId: {
            in: deletedCategory.productIDs,
          },
        },
      });

      await prisma.review.deleteMany({
        where: {
          productId: {
            in: deletedCategory.productIds,
          },
        },
      });

      //Publish the deleted category to pubsub model
      pubsub.publish("categoryChannel", {
        category: {
          mutation: "DELETED",
          data: deletedCategory,
        },
      });

      return deletedCategory;
    } catch (error) {
      logger.error(`Error in deleteCategory Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async updateCategory(
    parent,
    args,
    { prisma, pubsub, request, logger },
    info
  ) {
    //Log the start of the process
    logger.info("Starting category update process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can update a category
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to update a category by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to update a category");
      }

      //Converting categoryId to an integer
      const categoryId = parseInt(args.id, 10);

      //Find the category by its ID
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId, //Use the integer categoryId
        },
        include: {
          products: true, //Ensure we include products, even if empty
        },
      });

      //If category is not found
      if (!category) {
        logger.warn(`Category with ID ${categoryId} not found`);
        throw new Error("Category not found");
      }

      //Check if the new name already exists (if provided in args)
      if (args.data.name) {
        const nameExists = await prisma.category.findUnique({
          where: {
            name: args.data.name,
          },
        });
        if (nameExists && nameExists.id !== categoryId) {
          logger.warn(
            `Failed attempt to update category. Name already exists: ${args.data.name}`
          );
          throw new Error("Category name already exists");
        }
      }

      // Update the category using Prisma
      const updatedCategory = await prisma.category.update({
        where: {
          id: categoryId, // Use the integer categoryId
        },
        data: {
          ...args.data,
          // Ensure we update products if provided, otherwise keep existing ones
          products: args.data.products
            ? { set: args.data.products }
            : undefined,
        },
        include: {
          products: true, // Include products in the updated category
        },
      });

      //Log successful update
      logger.info(
        `Category with ID ${categoryId} updated successfully by Admin ${
          user.id
        }. Updated fields: ${Object.keys(args.data).join(", ")}`
      );

      //Publish the updated category to the pubsub model
      pubsub.publish("categoryChannel", {
        category: {
          mutation: "UPDATED",
          data: updatedCategory,
        },
      });

      return updatedCategory;
    } catch (error) {
      logger.error(`Error in updateCategory Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async createUser(parent, args, { prisma, bcrypt, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting user creation process...");

    try {
      //Extract and verify the token
      const userToken = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!userToken) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can create a user
      if (userToken.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to create a user by ${userToken.id} (Role: ${userToken.role})`
        );
        throw new Error("You do not have permission to create a user");
      }

      //To check if the email entered is unique or not
      const emailExists = await prisma.user.findUnique({
        where: {
          email: args.data.email,
        },
      });

      //If Email ID already exists
      if (emailExists) {
        logger.warn(
          `Failed attempt to create user. Email already in use: ${args.data.email}`
        );
        throw new Error("Email already in use");
      }

      //Validate the role through args (if provided)
      if (args.data.role && !["user", "admin"].includes(args.data.role)) {
        throw new Error("Invalid role. Role must be user or admin only");
      }

      //Validate password length (at least 6 characters)
      if (args.data.password.length < 6) {
        logger.warn(
          `Password validation failed for user creation. Password too short`
        );
        throw new Error("Password must be at least 6 characters long");
      }

      //Validate password contains at least one number
      if (!/\d/.test(args.data.password)) {
        logger.warn(
          `Password validation failed for user creation. No number in password`
        );
        throw new Error("Password must contain at least one number");
      }

      //Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(args.data.password, 10);

      //Create the user using Prisma
      const user = await prisma.user.create({
        data: {
          ...args.data,
          password: hashedPassword, //Replace plain password with hashed password
        },
      });

      logger.info(
        `User created successfully by Admin ${userToken.id}. New user: ${user.name} (Email: ${user.email})`
      );

      return user;
    } catch (error) {
      logger.error(`Error in createUser Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async deleteUser(parent, args, { prisma, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting user deletion process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Convert id to an integer
      const userId = parseInt(args.id, 10);

      //Validate if the user exists using Prisma
      const userExists = await prisma.user.findUnique({
        where: {
          id: userId, //Use the integer userId
        },
      });

      //If user not found
      if (!userExists) {
        logger.warn(`User with ID ${userId} not found`);
        throw new Error("User not found");
      }

      //Authorization: Only the user themselves or an admin can delete the user
      if (parseInt(user.id, 10) !== userId && user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to delete user by ${user.id} (Role: ${user.role}). Target user ID: ${userId}`
        );
        throw new Error("You do not have permission to delete this user");
      }

      //Delete the user using Prisma
      const deletedUser = await prisma.user.delete({
        where: {
          id: userId, //Use the integer userId
        },
      });

      //Log successful deletion
      logger.info(
        `User with ID ${userId} deleted successfully by ${user.id} (Role: ${user.role})`
      );

      //Remove all orders and reviews created by the user
      await prisma.order.deleteMany({
        where: {
          userId: userId, //Use the integer userId
        },
      });

      await prisma.review.deleteMany({
        where: {
          userId: userId, //Use the integer userId
        },
      });

      return deletedUser;
    } catch (error) {
      logger.error(`Error in deleteUser Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async updateUser(parent, args, { prisma, bcrypt, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting the user update process...");

    try {
      //Extract and verify the token
      const authUser = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!authUser) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Convert id to integer
      const userId = parseInt(args.id, 10);

      //Find the user by their ID using Prisma
      const user = await prisma.user.findUnique({
        where: {
          id: userId, //Use integer userId
        },
      });

      //If user not found
      if (!user) {
        logger.warn(`User with ID ${userId} not found`);
        throw new Error("User not found");
      }

      //Authorization: Only the user themselves or an admin can update the user
      if (parseInt(authUser.id, 10) !== userId && authUser.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to update user by ${authUser.id} (Role: ${authUser.role}). Target user ID: ${userId}`
        );
        throw new Error("You do not have permission to update this user");
      }

      //If the role is provided through args, validate it
      if (args.data.role && !["user", "admin"].includes(args.data.role)) {
        logger.warn(`Invalid role provided: ${args.data.role}`);
        throw new Error("Invalid role. Role must be user or admin");
      }

      //If the email is provided and already exists in another user, throw an error
      if (args.data.email) {
        const emailExists = await prisma.user.findUnique({
          where: {
            email: args.data.email,
          },
        });

        //If email exists
        if (emailExists && emailExists.id !== args.id) {
          logger.warn(
            `Email already in use by another user: ${args.data.email}`
          );
          throw new Error("Email already in use by another user");
        }
      }

      //Handle password updates with validations
      if (args.data.password) {
        //Validate password length (at least 6 characters)
        if (args.data.password.length < 6) {
          logger.warn(
            `Password validation failed for user update. Password too short`
          );
          throw new Error("Password must be at least 6 characters long");
        }

        //Validate password contains at least one number
        if (!/\d/.test(args.data.password)) {
          logger.warn(
            `Password validation failted for user update. No number in password`
          );
          throw new Error("Password must contain at least one number");
        }

        //Validate password is not the same as the current password using bcrypt method
        //bcrypt method hashes our new password using the same salt and hashing algorithm, and then compares it to the stored user's password
        const isSamePassword = await bcrypt.compare(
          args.data.password,
          user.password
        );
        if (isSamePassword) {
          logger.warn(
            `New password cannot be the same as the old password for user ID ${userId}`
          );
          throw new Error(
            "New password cannot be the same as the old password"
          );
        }

        //Hash the new password
        args.data.password = await bcrypt.hash(args.data.password, 10);
      }

      //Update the fields
      const updatedUser = await prisma.user.update({
        where: {
          id: userId, //Use integer userId
        },
        data: args.data,
      });

      //Log successful update
      logger.info(
        `User with ID ${userId} updated successfully by ${authUser.id} (Role: ${
          authUser.role
        }). Updated fields: ${Object.keys(args.data).join(", ")}`
      );

      return updatedUser;
    } catch (error) {
      logger.error(`Error in updateUser Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async createOrder(parent, args, { prisma, pubsub, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting order creation process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to create an oder by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to create an order");
      }

      //Converting the IDs to integers
      const userID = parseInt(args.data.userID, 10);
      const productID = parseInt(args.data.productID, 10);
      const companyID = parseInt(args.data.companyID, 10);

      //Validate if the user ID provided through args exists or not in the database
      const userExists = await prisma.user.findUnique({
        where: {
          id: userID,
        },
      });

      //If user does not exist
      if (!userExists) {
        logger.warn(`User with ID {userID} not found`);
        throw new Error("User not found");
      }

      //Validate if the product ID provided through args exists or not
      const productExists = await prisma.product.findUnique({
        where: {
          id: productID,
        },
      });

      //If product does not exist
      if (!productExists) {
        logger.warn(`Product with ID ${productID} not found`);
        throw new Error("Product not found");
      }

      //Check if the product is in stock or not
      if (!productExists.inStock) {
        logger.warn(`Product with ID ${productID} is out of stock`);
        throw new Error("Product is out of stock");
      }

      //Validate company ID
      const companyExists = await prisma.company.findUnique({
        where: {
          id: companyID,
        },
      });

      //If company not found
      if (!companyExists) {
        logger.warn(`Company with ID ${companyID} not found`);
        throw new Error("Company not found");
      }

      //Create the new order using Prisma
      const order = await prisma.order.create({
        data: {
          userId: userID,
          productId: productID,
          companyId: companyID,
          totalAmount: args.data.totalAmount,
          status: args.data.status,
          orderDate: args.data.orderDate,
        },
      });

      //Log successful creation
      logger.info(
        `Order created successfully by Admin ${user.id}. Ordr ID: ${order.id}, Total Amount: ${order.totalAmount}`
      );

      //Publish the order to the pubsub model
      pubsub.publish("orderChannel", {
        order: {
          mutation: "CREATED",
          data: order,
        },
      });

      return order;
    } catch (error) {
      logger.error(`Error in createOrder Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async deleteOrder(parent, args, { prisma, pubsub, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting order deletion process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Converting orderId to an integer
      const orderId = parseInt(args.id, 10);

      //Validate if the order exists using Prisma
      const orderExists = await prisma.order.findUnique({
        where: {
          id: orderId, //Use the integer orderId
        },
      });

      //If order not found
      if (!orderExists) {
        logger.warn(`Order with ID ${orderId} not found`);
        throw new Error("Order not found");
      }

      //Authorization: Only the user who created the order or an admin can delete it
      if (orderExists.userId !== user.id && user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to delete order with ID ${orderId} by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to delete this order");
      }

      //Delete the order using Prisma
      const deletedOrder = await prisma.order.delete({
        where: {
          id: orderId, //Use the integer orderId
        },
      });

      //Log successful deletion
      logger.info(
        `Order with ID ${orderId} deleted successfully by ${user.id} (Role: ${user.role})`
      );

      pubsub.publish("orderChannel", {
        order: {
          mutation: "DELETED",
          data: deletedOrder,
        },
      });

      return deletedOrder;
    } catch (error) {
      logger.error(`Error in deleteOrder Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async updateOrder(parent, args, { prisma, pubsub, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting order update process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Converting IDs to integer
      const orderId = parseInt(args.id, 10);
      const userId = parseInt(args.data.userID, 10);
      const productId = parseInt(args.data.productID, 10);
      const companyId = parseInt(args.data.companyID, 10);

      //Check whether the order exists or not
      const orderExists = await prisma.order.findUnique({
        where: {
          id: orderId, //Use the integer orderId
        },
      });

      //If order is not found
      if (!orderExists) {
        logger.warn(`Order with ID ${orderId} not found`);
        throw new Error("Order not found");
      }

      //Authorization: Only the user who created the order or an admin can update it
      if (orderExists.userId !== user.id && user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to update order with ID ${orderId} by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to update this order");
      }

      //Validate new user ID if provided
      if (args.data.userID) {
        const userExists = await prisma.user.findUnique({
          where: {
            id: userId, //Use the integer userId
          },
        });

        //If user does not exist
        if (!userExists) {
          logger.warn(`Invalid user ID provided: ${userId}`);
          throw new Error("Invalid user ID");
        }
      }
      //Validate new product ID if provided
      if (args.data.productID) {
        const productExists = await prisma.product.findUnique({
          where: {
            id: productId, //Use the integer productId
          },
        });

        //If product does not exist
        if (!productExists) {
          logger.warn(`Invalid product ID provided: ${productId}`);
          throw new Error("Invalid product ID");
        }
      }

      //Validate new company ID if provided
      if (args.data.companyID) {
        const companyExists = await prisma.company.findUnique({
          where: {
            id: companyId, //Use the integer companyId
          },
        });

        //If company does not exist
        if (!companyExists) {
          logger.warn(`Invalid company ID provided: ${companyId}`);
          throw new Error("Invalid company ID");
        }
      }

      //Update the order using Prisma
      const updatedOrder = await prisma.order.update({
        where: {
          id: orderId, //Use the integer orderId
        },
        data: {
          totalAmount: args.data.totalAmount,
          status: args.data.status,
          orderDate: args.data.orderDate,
          user: {
            connect: {
              id: userId,
            },
          },
          product: {
            connect: {
              id: productId,
            },
          },
          company: {
            connect: {
              id: companyId,
            },
          },
        },
      });

      //Log successful update
      logger.info(
        `Order with ID ${orderId} updated successfully by ${user.id} (Role: ${
          user.role
        }). Updated fields: ${Object.keys(args.data).join(", ")}`
      );

      //Publish the updated order to pubsub model
      pubsub.publish("orderChannel", {
        order: {
          mutation: "UPDATED",
          data: updatedOrder,
        },
      });

      return updatedOrder;
    } catch (error) {
      logger.error(`Error in updateOrder Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async createReview(parent, args, { prisma, pubsub }, info) {
    //Convert productID and userID to integers
    const productId = parseInt(args.data.productID, 10);
    const userId = parseInt(args.data.userID, 10);

    //Validate if the product exists using Prisma
    const productExists = await prisma.product.findUnique({
      where: {
        id: productId, //Use integer productId
      },
    });

    //If product does not exist
    if (!productExists) {
      throw new Error("Product not found");
    }

    //Validate if the user exists using Prisma
    const userExists = await prisma.user.findUnique({
      where: {
        id: userId, //Use integer userId
      },
    });

    //If user does not exist
    if (!userExists) {
      throw new Error("User not found");
    }

    //Validate rating
    if (args.data.rating < 0 || args.data.rating > 5) {
      throw new Error("Rating must be between 0 and 5");
    }

    //Create the review using Prisma
    const review = await prisma.review.create({
      data: {
        rating: args.data.rating,
        comment: args.data.comment,
        product: {
          connect: {
            id: productId, //Connecting to the existing product
          },
        },
        user: {
          connect: {
            id: userId, //Connecting to the existing user
          },
        },
      },
    });

    //Publish the review to the pubsub model
    pubsub.publish(`reviewChannel_${args.data.productID}`, {
      review: {
        mutation: "CREATED",
        data: review,
      },
    });

    return review;
  },

  async deleteReview(parent, args, { prisma, pubsub, request }, info) {
    //Extract and verify the token provided by a user
    const user = verifyToken(request.headers.authorization);

    if (!user) {
      throw new Error("Authentication required");
    }

    //Convert reviewId to integer
    const reviewId = parseInt(args.id, 10);

    //Validate if the review exists using Prisma
    const reviewExists = await prisma.review.findUnique({
      where: {
        id: reviewId, //Use integer reviewId
      },
    });

    //If review not found
    if (!reviewExists) {
      throw new Error("Review not found");
    }

    //Authorization:  Admins can delete any review, users can delete only their own
    if (user.role !== "admin" && reviewExists.userId !== user.id) {
      throw new Error("You do not have permission to delete this review");
    }

    //Converting to be deleted Review's product ID from integer to string for subscription
    const productID = reviewExists.productId.toString();

    //Delete the review using Prisma
    const deletedReview = await prisma.review.delete({
      where: {
        id: reviewId, //Use integer reviewId
      },
    });

    //Publish the deleted review to the pubsub model
    pubsub.publish(`reviewChannel_${productID}`, {
      review: {
        mutation: "DELETED",
        data: deletedReview,
      },
    });

    return deletedReview;
  },

  async updateReview(parent, args, { prisma, pubsub, request }, info) {
    //Extract and verify the token
    const user = verifyToken(request.headers.authorization);

    //If authorization field does not exist (No Bearer token provided in headers by user)
    if (!user) {
      throw new Error("Authentication required");
    }

    //Convert Id to integer
    const reviewId = parseInt(args.id, 10);
    const productId = parseInt(args.data.productID, 10); //If given as input
    const userId = parseInt(args.data.userID, 10); //If given as input

    //Validate if the review exists using Prisma
    const reviewExists = await prisma.review.findUnique({
      where: {
        id: reviewId, //Use integer reviewId
      },
    });

    //If review not found
    if (!reviewExists) {
      throw new Error("Review not found");
    }

    //Authorization: Admins can update any review, users can update only their own
    if (user.role !== "admin" && reviewExists.userId !== user.id) {
      throw new Error("You do not have permission to update this review");
    }

    //Validate the provided product ID (if any)
    if (args.data.productID) {
      const productExists = await prisma.product.findUnique({
        where: {
          id: productId, //Use integer productId
        },
      });

      //If product does not exist
      if (!productExists) {
        throw new Error("Invalid product ID");
      }
    }

    //Validate the provided user ID (if any)
    if (args.data.userID) {
      const userExists = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      //If user does not exist
      if (!userExists) {
        throw new Error("Invalid user ID");
      }
    }

    //Update the review using Prisma
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId, //Use integer reviewId
      },
      data: args.data,
    });

    //To convert productId from Integer to String for subscritions
    const productID = reviewExists.productId.toString();

    //Publish the updated review to the pubsub model
    pubsub.publish(`reviewChannel_${productID}`, {
      review: {
        mutation: "UPDATED",
        data: updatedReview,
      },
    });

    return updatedReview;
  },

  async createCompany(parent, args, { prisma, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting company creation process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can create a company
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to create a company by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to create a company");
      }

      //Validate that the company name does not already exist
      const companyExists = await prisma.company.findUnique({
        where: {
          name: args.data.name,
        },
      });

      //If the company name already exists
      if (companyExists) {
        logger.warn(
          `Failed attempt to create company. Company name already exists: ${args.data.name}`
        );
        throw new Error("Company name already exists");
      }

      //Create the company using Prisma
      const company = await prisma.company.create({
        data: {
          ...args.data,
        },
      });

      //Log successful creation
      logger.info(
        `Company created successfully by Admin ${user.id}. New company: ${company.name}`
      );

      return company;
    } catch (error) {
      logger.error(`Error in createCompany Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async deleteCompany(parent, args, { prisma, request, logger }, info) {
    //Log the start of the process
    logger.info("Strating company deletion process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can delete a company
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to delete a company by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to delete a company");
      }

      //Validate if the company name exists using Prisma
      const companyExists = await prisma.company.findUnique({
        where: {
          id: args.id,
        },
      });

      //If the company is not found
      if (!companyExists) {
        logger.warn(`Company with ID ${args.id} not found`);
        throw new Error("Company not found");
      }

      //Delete the company using Prisma
      const deletedCompany = await prisma.company.delete({
        where: {
          id: args.id,
        },
      });

      //Log successful deletion
      logger.info(
        `Company with ID ${args.id} deleted successfully by Admin ${user.id}`
      );

      //Clean up related orders using Prisma
      await prisma.order.deleteMany({
        where: {
          companyId: args.id,
        },
      });

      return deletedCompany;
    } catch (error) {
      logger.error(`Error in deleteCompany Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },

  async updateCompany(parent, args, { prisma, request, logger }, info) {
    //Log the start of the process
    logger.info("Starting company update process...");

    try {
      //Extract and verify the token
      const user = verifyToken(request.headers.authorization);

      //If no valid token is provided
      if (!user) {
        logger.warn("Authentication required. No valid token provided");
        throw new Error("Authentication required");
      }

      //Authorization: Only admins can update a company
      if (user.role !== "admin") {
        logger.warn(
          `Unauthorized attempt to update a company by ${user.id} (Role: ${user.role})`
        );
        throw new Error("You do not have permission to update a company");
      }

      //Find the company by its ID using Prisma
      const companyExists = await prisma.company.findUnique({
        where: {
          id: args.id,
        },
      });

      //If company not found
      if (!companyExists) {
        logger.warn(`Company with ID ${args.id} not found`);
        throw new Error("Company not found");
      }

      //If the new name is provided, validate that it doesn't already exist
      if (args.data.name) {
        const nameExists = await prisma.company.findUnique({
          where: {
            name: args.data.name,
          },
        });

        //If name exists
        if (nameExists && nameExists.id !== args.id) {
          logger.warn(
            `Failed attempt to update company. Name already exists: ${args.data.name}`
          );
          throw new Error("Company name already exists");
        }
      }

      //Update the company name using Prisma
      const updatedCompany = await prisma.company.update({
        where: {
          id: args.id,
        },
        data: args.data,
      });

      //Log successful update
      logger.info(
        `Company with ID ${args.id} updated successfully by Admin ${
          user.id
        }. Updated fields: ${Object.keys(args.data).join(",")}`
      );

      return updatedCompany;
    } catch (error) {
      logger.error(`Error in updateCompany Mutation: ${error.message}`);
      throw new Error(error.message);
    }
  },
};

export { Mutation as default };
