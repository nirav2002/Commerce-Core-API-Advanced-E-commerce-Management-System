const User = {
  orders(parent, args, { db }, info) {
    return db.orders.filter((order) => {
      return order.userID === parent.id;
    });
  },
  reviews(parent, args, { db }, info) {
    return db.reviews.filter((review) => {
      return review.userID === parent.id;
    });
  },
};

export { User as default };
