const pagination = async (
  body,
  model,
  defaultPopulate = false
) => {
  try {
    console.log({ body });
    // Extract parameters from the request body, with fallback defaults
    const limit = parseInt(body.perPage, 10) || 10000;
    const page = parseInt(body.page, 10) || 1;
    const keyword = body.keyword || null;
    const sort = body.sort || null;
    const filter = body?.filter || {};
    const selectedField = body.selectedField || {};
    const populate =
      body.populate !== undefined ? body.populate : defaultPopulate;

    // Construct the search query
    const search = filter;
    if (keyword) {
      search.name = { $regex: keyword, $options: "i" };
    }

    // Handle sorting if provided
    let sortBy = {};
    if (sort) {
      if (typeof sort === "string") {
        switch (sort) {
          case "date_asc":
            sortBy.createdAt = 1;
            break;
          case "date_desc":
            sortBy.createdAt = -1;
            break;
          case "title_asc":
            sortBy.name = 1;
            break;
          case "title_desc":
            sortBy.name = -1;
            break;
          default:
            console.warn(`Unrecognized sort option: ${sort}`);
            break;
        }
      } else if (typeof sort === "object") {
        sortBy = sort;
      }
    }

    // Construct the select fields
    const select =
      Object.keys(selectedField).length > 0
        ? Object.keys(selectedField).join(" ")
        : model.schema.paths && Object.keys(model.schema.paths).join(" ");

    // Calculate pagination parameters
    const skips = limit * (page - 1);

    // Fetch data with or without population

    console.log({ search });

    const query = model
      .find(search)
      .select(select)
      .sort(sortBy)
      .skip(skips)
      .limit(limit)
      .lean();

    const list = populate
      ? await query.populate(populate).exec()
      : await query.exec();
    const total = await model.countDocuments(search);
    const totalPages = Math.ceil(total / limit);

    // Return the pagination response
    return {
      pagination: {
        total: totalPages,
        page: page,
        limit: limit,
      },
      list,
    };
  } catch (err) {
    console.error("Pagination error:", err);
    return {
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
      },
      list: [],
      error: err.message,
    };
  }
};

module.exports = pagination