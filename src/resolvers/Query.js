async function products(parent, args, { prisma }, info) {
  const page = args.page || 1; //Default to page 1
  const limit = args.limit || 5; //Default to 5 items per page
  const skip = (page - 1) * limit; //Calculate the number of items to skip
  const searchTerm = args.search || ""; //Default to an empty string if no search term is provided
  const maxPrice = args.maxPrice || null; //Default to null if no maxPrice is provided
  const minPrice = args.minPrice || null; //Default to null if no minPrice is provided

  //Build the filter conditions dynamically
  const filters = {
    name: {
      startsWith: searchTerm, //Search products whose name starts with the searchTerm
      mode: "insensitive",
    },
  };

  //Add price filters if provided
  if (minPrice !== null || maxPrice !== null) {
    filters.price = {};
    if (minPrice !== null) {
      filters.price.gte = minPrice; //Price greater than or eqaul to minPrice
    }
    if (maxPrice !== null) {
      filters.price.lte = maxPrice; //Price less than or equal to maxPrice
    }
  }

  //Count total matching products
  const totalCount = await prisma.product.count({
    where: filters,
  });

  //Fetch paginated and filtered products
  const items = await prisma.product.findMany({
    where: filters,
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
  const limit = args.limit || 5; //Default to 5 users per page
  const skip = (page - 1) * limit; //Calculate the number of items to skip
  const searchTerm = args.search || ""; //Default to an empty string if no search term is provided

  //Count total matching users
  const totalCount = await prisma.user.count({
    where: {
      name: {
        startsWith: searchTerm, //Search users whose name starts with the searchTerm
        mode: "insensitive", //Case-insensitive search
      },
    },
  });

  //Fetch the paginated and filtered users
  const items = await prisma.user.findMany({
    where: {
      name: {
        startsWith: searchTerm, //Apply search filter for name
        mode: "insensitive",
      },
    },
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
