const Query = {
  products(parent, args, { db }, info) {
    return db.products;
  },
  categories(parent, args, { db }, info) {
    return db.categories;
  },
  users(parent, args, { db }, info) {
    return db.users;
  },
  orders(parent, args, { db }, info) {
    return db.orders;
  },
  reviews(parent, args, { db }, info) {
    return db.reviews;
  },
  companies(parent, args, { db }, info) {
    return db.companies;
  },
};

export { Query as default };
