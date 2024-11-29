const Review = {
  user(parent, args, { db }, info) {
    return db.users.find((user) => {
      return user.id === parent.userID;
    });
  },
  product(parent, args, { db }, info) {
    return db.products.find((product) => {
      return product.id === parent.productID;
    });
  },
};

export { Review as default };
