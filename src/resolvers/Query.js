async function products(parent, args, { prisma }, info) {
  return await prisma.product.findMany();
}

async function categories(parent, args, { prisma }, info) {
  const categories = await prisma.category.findMany({
    include: {
      products: true, // Ensure we include products
    },
  });

  // Make sure that the products field is always an array (even if empty)
  return categories.map((category) => ({
    ...category,
    products: category.products || [], // If no products, return an empty array
  }));
}

async function users(parent, args, { prisma }, info) {
  return await prisma.user.findMany();
}

async function orders(parent, args, { prisma }, info) {
  return await prisma.order.findMany();
}

async function reviews(parent, args, { prisma }, info) {
  return await prisma.review.findMany();
}

async function companies(parent, args, { prisma }, info) {
  return await prisma.company.findMany();
}

const Query = {
  products,
  categories,
  users,
  orders,
  reviews,
  companies,
};

export { Query as default };
