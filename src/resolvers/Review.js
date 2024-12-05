const Review = {
  user(parent, args, { prisma }, info) {
    //Convert userID to integer before querying
    const userId = parseInt(parent.userId, 10);

    //Query user by ID using Prisma
    return prisma.user.findUnique({
      where: {
        id: userId, //Use integer userId
      },
    });
  },
  product(parent, args, { prisma }, info) {
    //Convert productID to integer before querying
    const productId = parseInt(parent.productId, 10);

    //Query product by ID using Prisma
    return prisma.product.findUnique({
      where: {
        id: productId, //Use integer productId
      },
    });
  },
};

export { Review as default };
