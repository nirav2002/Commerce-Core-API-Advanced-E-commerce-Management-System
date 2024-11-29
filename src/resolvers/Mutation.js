import uuidv4 from "uuid";

const Mutation = {
  createProduct(parent, args, { db, pubsub }, info) {
    //Validate that the categoryID exists
    const categoryExists = db.categories.some((category) => {
      return category.id === args.data.categoryID;
    });

    //If category does not exist
    if (!categoryExists) {
      throw new Error("Category not found");
    }

    //Create the product
    const product = {
      //Create a unique ID
      id: uuidv4(),
      ...args.data,
    };

    //Adding the product to the products array
    db.products.push(product);

    //Publishing the product to the pubsub model
    pubsub.publish("productChannel", {
      product: {
        mutation: "CREATED",
        data: product, //Passing the product object here (Newly created object)
      },
    });

    return product;
  },
  deleteProduct(parent, args, { db, pubsub }, info) {
    //Find the index of the product to be deleted
    const productIndex = db.products.findIndex((product) => {
      return product.id === args.id;
    });

    //If product not found
    if (productIndex === -1) {
      throw new Error("Product not found");
    }

    //Remove the product from the products array and store it
    const deletedProduct = db.products.splice(productIndex, 1); //An array

    //Remove all orders associated with the product
    db.orders = db.orders.filter((order) => {
      return order.productID !== args.id;
    });

    //Remove all reviews associated with the product
    db.reviews = db.reviews.filter((review) => {
      return review.productID !== args.id;
    });

    //Publish the deleted product to pubsub model
    pubsub.publish("productChannel", {
      product: {
        mutation: "DELETED",
        data: deletedProduct[0], //Sending the deleted product back
      },
    });

    return deletedProduct[0];
  },
  updateProduct(parent, args, { db, pubsub }, info) {
    //Find the product by its ID
    const product = db.products.find((product) => {
      return product.id === args.id;
    });

    //If product is not found
    if (!product) {
      throw new Error("Product not found");
    }

    //If categoryId is provided, validate it exists
    if (args.data.categoryID) {
      const categoryExists = db.categories.some((category) => {
        return category.id === args.data.categoryID;
      });
      if (!categoryExists) {
        throw new Error("Invalid category ID");
      }
    }

    //Update the fields if they are provided
    if (typeof args.data.name === "string") {
      product.name = args.data.name;
    }
    if (typeof args.data.price === "number") {
      product.price = args.data.price;
    }
    if (typeof args.data.inStock === "boolean") {
      product.inStock = args.data.inStock;
    }
    if (args.data.categoryID) {
      product.categoryID = args.data.categoryID;
    }

    //Publish the updated product to the pubsub model
    pubsub.publish("productChannel", {
      product: {
        mutation: "UPDATED",
        data: product, //Returning the updated product
      },
    });

    return product;
  },

  createCategory(parent, args, { db }, info) {
    const productIDs = args.data.products || [];

    //Validate if the product IDS provided through args exist in the products
    const productExists = productIDs.filter(
      (productID) => !db.products.some((product) => product.id === productID)
    );

    //If there are invalid product IDs,
    if (productExists.length > 0) {
      throw new Error("Invalid Product IDs given");
    }

    //Check if the category name already exists or not
    const categoryExists = db.categories.some((category) => {
      return category.name.toLowerCase() === args.data.name.toLowerCase();
    });

    if (categoryExists) {
      throw new Error(`Category name ${args.data.name} already exists`);
    }

    //Create the new category object
    const category = {
      //Generate a unique ID for the category
      id: uuidv4(),
      ...args.data,
    };

    //Add the new category to the categories array
    db.categories.push(category);

    return category;
  },
  deleteCategory(parent, args, { db }, info) {
    //Find the category index
    const categoryIndex = db.categories.findIndex((category) => {
      return category.id === args.id;
    });

    //If category not found
    if (categoryIndex === -1) {
      throw new Error("Category not found");
    }

    //Remove the category
    const deletedCategory = db.categories.splice(categoryIndex, 1); //An array

    //linkedProducts is an array that contains the products that are linked to the category being deleted
    const linkedProducts = db.products.filter((product) => {
      return product.categoryID === args.id;
    });

    //Find and remove all products linked to the category
    db.products = db.products.filter((product) => {
      product.categoryID !== args.id;
    });

    //Remove all orders and reviews associated with the deleted product
    db.orders = db.orders.filter((order) => {
      return !linkedProducts.some((product) => {
        return product.id === order.productID;
      });
    });

    db.reviews = db.reviews.filter((review) => {
      return !linkedProducts.some((product) => {
        return product.id === review.productID;
      });
    });

    return deletedCategory[0];
  },
  updateCategory(parent, args, { db }, info) {
    //Find the category by its ID
    const category = db.categories.find((category) => {
      return category.id === args.id;
    });

    //If category is not found
    if (!category) {
      throw new Error("Category not found");
    }

    //Check if the new name already exists (if provided)
    if (args.data.name) {
      const nameExists = db.categories.some((category) => {
        return (
          category.name.toLowerCase() === args.data.name.toLowerCase() &&
          category.id !== args.id
        );
      });

      //If name exists
      if (nameExists) {
        throw new Error("Category name already exists");
      }
    }

    //Update the fields if they are provided
    if (typeof args.data.name === "string") {
      category.name = args.data.name;
    }
    if (typeof args.data.description === "string") {
      category.description = args.data.description;
    }
    return category;
  },

  createUser(parent, args, { db }, info) {
    //To check if the email entered is unique or not
    const emailExists = db.users.some((user) => {
      return user.email === args.data.email;
    });

    //If Email Id already exists
    if (emailExists) {
      throw new Error("Email already in use");
    }

    const user = {
      //Create a new unique ID for the user
      id: uuidv4(),
      ...args.data,
    };

    //Adding the user to the users array
    db.users.push(user);

    return user;
  },
  deleteUser(parent, args, { db }, info) {
    //Validate if the user exists
    const userIndex = db.users.findIndex((user) => {
      return user.id === args.id;
    });

    //If user not found
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    //Remove the user
    const deletedUser = db.users.splice(userIndex, 1); //An array

    //Remove all orders and reviews created by the user
    db.orders = db.orders.filter((order) => {
      return order.userID !== args.id;
    });

    db.reviews = db.reviews.filter((review) => {
      return review.userID !== args.id;
    });

    return deletedUser[0];
  },
  updateUser(parent, args, { db }, info) {
    //Find the user by their ID
    const user = db.users.find((user) => {
      return user.id === args.id;
    });

    //If user not found
    if (!user) {
      throw new Error("User not found");
    }

    //If the email is provided and already exists in another user, throw an error
    if (args.data.email) {
      const emailExists = db.users.some((user) => {
        return user.email === args.data.email && user.id !== args.id;
      });
      if (emailExists) {
        throw new Error("Email already in use by another user");
      }
    }

    //Update the fields if they are provided
    if (typeof args.data.name === "string") {
      user.name = args.data.name;
    }
    if (typeof args.data.email === "string") {
      user.email = args.data.email;
    }
    if (typeof args.data.age === "number") {
      user.age = args.data.age;
    }

    return user;
  },

  createOrder(parent, args, { db, pubsub }, info) {
    //Validate if the user ID provided through args exists or not in the users
    const userExists = db.users.some((user) => {
      return user.id === args.data.userID;
    });

    //If user does not exist
    if (!userExists) {
      throw new Error("User not found");
    }

    //Validate if the product ID provided through args exists or not in the users
    const productExists = db.products.find((product) => {
      return product.id === args.data.productID;
    });

    //If product does not exist
    if (!productExists) {
      throw new Error("Product not found");
    }

    //Check if the product is in stock or not
    if (!productExists.inStock) {
      throw new Error("Product is out of stock");
    }

    //Validate company ID
    const companyExists = db.companies.some((company) => {
      return company.id === args.data.companyID;
    });

    if (!companyExists) {
      throw new Error("Company not found");
    }

    //Create the new order object
    const order = {
      id: uuidv4(),
      ...args.data,
    };

    //Publish the order to the pubsub model
    pubsub.publish("orderChannel", {
      order: {
        mutation: "CREATED",
        data: order,
      },
    });

    //Add the order to the orders array
    db.orders.push(order);

    return order;
  },
  deleteOrder(parent, args, { db, pubsub }, info) {
    //Validate if the order exists
    const orderIndex = db.orders.findIndex((order) => {
      return order.id === args.id;
    });

    //If order is not found
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }

    //Remove the order
    const deletedOrder = db.orders.splice(orderIndex, 1); //An array

    //Publish the deleted order to pubsub model
    pubsub.publish("orderChannel", {
      order: {
        mutation: "DELETED",
        data: deletedOrder[0],
      },
    });

    return deletedOrder[0];
  },
  updateOrder(parent, args, { db, pubsub }, info) {
    //Find the order by its ID
    const order = db.orders.find((order) => {
      return order.id === args.id;
    });

    //If the order is not found
    if (!order) {
      throw new Error("Order not found");
    }

    //Validate new user ID if provided
    if (args.data.userID) {
      const userExists = db.users.some((user) => {
        return user.id === args.data.userID;
      });
      if (!userExists) {
        throw new Error("Invalid user ID");
      }
    }

    //Validate new product ID if provided
    if (args.data.productID) {
      const productExists = db.products.some((product) => {
        return product.id === args.data.productID;
      });
      if (!productExists) {
        throw new Error("Invalid product ID");
      }
    }

    //Validate new company ID if provided
    if (args.data.companyID) {
      const companyExists = db.companies.some((company) => {
        return company.id === args.data.companyID;
      });
      if (!companyExists) {
        throw new Error("Invalid company ID");
      }
    }

    //Update the fields if provided
    if (typeof args.data.totalAmount === "number") {
      order.totalAmount = args.data.totalAmount;
    }
    if (typeof args.data.status === "string") {
      order.status = args.data.status;
    }
    if (typeof args.data.orderDate === "string") {
      order.orderDate = args.data.orderDate;
    }
    if (args.data.userID) {
      order.userID = args.data.userID;
    }
    if (args.data.productID) {
      order.productID = args.data.productID;
    }
    if (args.data.companyID) {
      order.companyID = args.data.companyID;
    }

    //Publish the updated order to pubsub model
    pubsub.publish("orderChannel", {
      order: {
        mutation: "UPDATED",
        data: order,
      },
    });

    return order;
  },

  createReview(parent, args, { db, pubsub }, info) {
    //Validate product ID
    const productExists = db.products.find((product) => {
      return product.id === args.data.productID;
    });

    //If product does not exist
    if (!productExists) {
      throw new Error("Product not found");
    }

    //Validate user ID
    const userExists = db.users.find((user) => {
      return user.id === args.data.userID;
    });

    //If user not found
    if (!userExists) {
      throw new Error("User not found");
    }

    //Validate rating
    if (args.data.rating < 0 || args.data.rating > 5) {
      throw new Error("Rating must be between 0 and 5");
    }

    //Create the review object
    const review = {
      //Create a unique id for each review
      id: uuidv4(),
      ...args.data,
    };

    //Add the review to the reviews array
    db.reviews.push(review);

    //Publish the review to the pubsub model
    pubsub.publish(`reviewChannel_${args.data.productID}`, {
      review: {
        mutation: "CREATED",
        data: review,
      },
    });

    return review;
  },
  deleteReview(parent, args, { db, pubsub }, info) {
    //Validate if the review exists
    const reviewIndex = db.reviews.findIndex((review) => {
      return review.id === args.id;
    });

    //If review not found
    if (reviewIndex === -1) {
      throw new Error("Review not found");
    }

    //Remove the review
    const deletedReview = db.reviews.splice(reviewIndex, 1); //An array

    //Clean up user's reviews
    db.users = db.users.map((user) => {
      return {
        ...user,
        reviews: user.reviews
          ? user.reviews.filter((review) => review.id !== args.id)
          : [],
      };
    });

    //Publish the deleted review to the pubsub model
    pubsub.publish(`reviewChannel_${deletedReview[0].productID}`, {
      review: {
        mutation: "DELETED",
        data: deletedReview[0],
      },
    });

    return deletedReview[0];
  },
  updateReview(parent, args, { db, pubsub }, info) {
    //Find the review by its ID
    const review = db.reviews.find((review) => {
      return review.id === args.id;
    });

    //If review is not found
    if (!review) {
      throw new Error("Review not found");
    }

    //Validate the provided product ID (if any)
    if (args.data.productID) {
      const productExists = db.products.some((product) => {
        return product.id === args.data.productID;
      });
      if (!productExists) {
        throw new Error("Invalid product ID");
      }
    }

    //Validate the provided user ID (if any)
    if (args.data.userID) {
      const userExists = db.users.some((user) => {
        return user.id === args.data.userID;
      });
      if (!userExists) {
        throw new Error("Invalid user ID");
      }
    }

    //Update the fields if they are provided
    if (typeof args.data.rating === "number") {
      if (args.data.rating < 0 || args.data.rating > 5) {
        throw new Error("Rating must be between 0 and 5");
      }
      review.rating = args.data.rating;
    }
    if (typeof args.data.comment === "string") {
      review.comment = args.data.comment;
    }
    if (args.data.productID) {
      review.productID = args.data.productID;
    }
    if (args.data.userID) {
      review.userID = args.data.userID;
    }

    //Publish the review update event
    pubsub.publish(`reviewChannel_${review.productID}`, {
      review: {
        mutation: "UPDATED",
        data: review,
      },
    });

    return review;
  },

  createCompany(parent, args, { db }, info) {
    //Validate that the company name given through the args does not actually exist
    const companyExists = db.companies.some((company) => {
      return company.name.toLowerCase() === args.data.name.toLowerCase();
    });

    //If company name already exists
    if (companyExists) {
      throw new Error("Company name already exists");
    }

    //Create a new company object
    const company = {
      //Create a unique ID for company
      id: uuidv4(),
      ...args.data,
    };

    //Add the new company to the companies array
    db.companies.push(company);

    return company;
  },
  deleteCompany(parent, args, { db }, info) {
    //Validate if the company exists
    const companyIndex = db.companies.findIndex((company) => {
      return company.id === args.id;
    });

    //If company does not exist
    if (companyIndex === -1) {
      throw new Error("Company not found");
    }

    //Remove the company
    const deletedCompany = db.companies.splice(companyIndex, 1); //An array

    //Clean up related orders
    db.orders = db.orders.filter((order) => {
      return order.companyID !== args.id;
    });

    return deletedCompany[0];
  },
  updateCompany(parent, args, { db }, info) {
    //Find the company by its ID
    const company = db.companies.find((company) => {
      return company.id === args.id;
    });

    //If the company is not found
    if (!company) {
      throw new Error("Company not found");
    }

    //Validate the provided name (if any)
    if (args.data.name) {
      const nameExists = db.companies.some((company) => {
        return (
          company.name.toLowerCase() === args.data.name.toLowerCase() &&
          company.id !== args.id
        );
      });
      if (nameExists) {
        throw new Error("Company name already exists");
      }
    }

    //Update the fields if they are provided
    if (typeof args.data.name === "string") {
      company.name = args.data.name;
    }
    if (typeof args.data.location === "string") {
      company.location = args.data.location;
    }
    if (typeof args.data.industry === "string") {
      company.industry = args.data.industry;
    }

    return company;
  },
};

export { Mutation as default };
