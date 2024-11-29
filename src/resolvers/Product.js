const Product = {
  category(parent, args, { db }, info) {
    return db.categories.find((category) => {
      return category.id === parent.categoryID;
    });
  },
  orders(parent, args, { db }, info) {
    return db.orders.filter((order) => {
      return order.productID === parent.id;
    });
  },
  reviews(parent, args, { db }, info) {
    return db.reviews.filter((review) => {
      //Match the associated product ID on reviews to the productID (parent's)
      return (review.productID = parent.id);
    });
  },
};

export { Product as default };
