const User = {
  orders(parent, args, { prisma }, info) {
    //Ensure it returns an empty array if no orders ae found
    return (
      prisma.order.findMany({
        where: {
          userId: parent.id,
        },
      }) || []
    );
  },

  reviews(parent, args, { prisma }, info) {
    //Ensure it returns an empty array if no reviews are found
    return (
      prisma.review.findMany({
        where: {
          userId: parent.id,
        },
      }) || []
    );
  },
};

export { User as default };
