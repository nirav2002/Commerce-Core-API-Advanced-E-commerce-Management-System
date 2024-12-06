const Subscription = {
  order: {
    async subscribe(parent, args, { pubsub }, info) {
      //Specify the channel name for the subscription
      return pubsub.asyncIterator("orderChannel");
    },
  },

  product: {
    async subscribe(parent, args, { pubsub }, info) {
      //Specify the channel name for the subscription
      return pubsub.asyncIterator("productChannel");
    },
  },

  review: {
    async subscribe(parent, args, { prisma, pubsub }, info) {
      //Validate if the product exists using Prisma
      const product = await prisma.product.findUnique({
        where: {
          id: parseInt(args.productID, 10),
        },
      });

      //If no product found
      if (!product) {
        throw new Error("Product not found");
      }

      //Specify the channel name for the subscription
      return pubsub.asyncIterator(`reviewChannel_${args.productID}`);
    },
  },
};

export { Subscription as default };
