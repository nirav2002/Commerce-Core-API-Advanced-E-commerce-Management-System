async function products(parent, args, { prisma }, info) {
  const page = args.page || 1; //Default to page 1
  const limit = args.limit || 4; //Default to 4 items per page
  const skip = (page - 1) * limit; //Calculate the number of items to skip

  //Get total count of products
  const totalCount = await prisma.product.count();

  //Fetch the paginated products
  const items = await prisma.product.findMany({
    skip,
    take: limit,
  });

  //Calculate previous and next page numbers
  let prevPage;
  let nextPage;

  if (page > 1) {
    prevPage = page - 1;
  } else {
    prevPage = null;
  }

  if (skip + limit < totalCount) {
    nextPage = page + 1;
  } else {
    nextPage = null;
  }

  return {
    items,
    prevPage,
    nextPage,
  };
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
  const page = args.page || 1; //Default to page 1
  const limit = args.limit || 4; //Default to 4 items per page
  const skip = (page - 1) * limit; //Calculate the number of items to skip

  //Get total count of users
  const totalCount = await prisma.user.count();

  //Fetch the paginated users
  const items = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: {
      id: "asc", //Sort users by ID in ascending order
    },
  });

  //Calculate previous and next page numbers
  let prevPage;
  let nextPage;

  if (page > 1) {
    prevPage = page - 1;
  } else {
    prevPage = null;
  }

  if (skip + limit < totalCount) {
    nextPage = page + 1;
  } else {
    nextPage = null;
  }

  return {
    items,
    prevPage,
    nextPage,
  };
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
