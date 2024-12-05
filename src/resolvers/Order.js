const Order = {
  user(parent, args, { prisma }, info) {
    return prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    });
  },
  product(parent, args, { prisma }, info) {
    return prisma.product.findUnique({
      where: {
        id: parent.productId,
      },
    });
  },
  company(parent, args, { prisma }, info) {
    return prisma.company.findUnique({
      where: {
        id: parent.companyId,
      },
    });
  },
};

export { Order as default };
