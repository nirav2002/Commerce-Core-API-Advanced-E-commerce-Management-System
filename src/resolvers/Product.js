const Product = {
  category(parent, args, { prisma }, info) {
    // Directly use parent.categoryID for the category query
    if (!parent.categoryID) {
      throw new Error("Category ID is missing.");
    }
    return prisma.category.findUnique({
      where: {
        id: parent.categoryID, // Fetch the category by parent.categoryID
      },
    });
  },
  orders(parent, args, { prisma }, info) {
    return prisma.order.findMany({
      where: {
        productId: parent.id,
      },
    });
  },
  reviews(parent, args, { prisma }, info) {
    return prisma.review.findMany({
      where: {
        productId: parent.id,
      },
    });
  },
};

export { Product as default };
