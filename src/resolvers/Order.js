const Order = {
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
  company(parent, args, { db }, info) {
    return db.companies.find((company) => {
      return company.id === parent.companyID;
    });
  },
};

export { Order as default };
