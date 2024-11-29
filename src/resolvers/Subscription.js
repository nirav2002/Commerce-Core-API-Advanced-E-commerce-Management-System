const Subscription = {
  order: {
    subscribe(parent, args, { pubsub }, info) {
      //Specify the channel name for the subscription
      return pubsub.asyncIterator("orderChannel");
    },
  },
  product: {
    subscribe(parent, args, { pubsub }, info) {
      //Specify the channel name for the subscription
      return pubsub.asyncIterator("productChannel");
    },
  },
  review: {
    subscribe(parent, args, { db, pubsub }, info) {
      //Validate if the product exists
      const product = db.products.find((product) => {
        return product.id === args.productID;
      });

      if (!product) {
        throw new Error("Product not found");
      }

      //Specify the channel name for the subscription
      return pubsub.asyncIterator(`reviewChannel_${args.productID}`);
    },
  },
};

export { Subscription as default };
