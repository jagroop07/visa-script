const pagination  = require("./pagination");

class ResourceController {
  constructor(model) {
    this.model = model;
  }

  // Fetch a single item by ID
  async single(request, response) {
    const { id } = request.params;
    try {
      const item = request.query.populate
        ? await this.model.findById(id).populate(request.query.populate)
        : await this.model.findById(id);

      if (!item) {
        return response
          .status(404)
          .json({ success: false, message: `No item found for id ${id}` });
      }

      return response.json({ success: true, details: item });
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: error.message });
    }
  }

  // Delete an item by ID
  async delete(request, response) {
    const { id } = request.params;
    try {
      const item = await this.model.findById(id).lean();

      if (!item) {
        return response
          .status(404)
          .json({ success: false, message: `No item found for id ${id}` });
      }

      await this.model.findByIdAndDelete(id);
      return response.json({
        success: true,
        message: "Item successfully removed",
      });
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: error.message });
    }
  }

  // List items with pagination
  async list(request, response) {
    try {
      const body = request.body;
      console.log({ body }, this.model);

      const details = await pagination(body, this.model);
      return response.json({ success: true, details });
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: error.message });
    }
  }

  // Create a new item
  async create(request, response) {
    try {
      const body = request.body; // For POST, use body instead of json()
      console.log(`[resources][create] -> ${JSON.stringify(body)}`);

      const data = await this.model.create({ ...body }); // author: request.auth.user._id
      return response.json({
        success: true,
        message: "Item successfully added",
        details: data,
      });
    } catch (error) {
      console.error("Error creating item:", error);

      if (error.name === "ValidationError") {
        // Handle Mongoose validation errors
        const errorDetails = Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        }));

        return response.json({
          success: false,
          message: "Validation error",
          errors: errorDetails,
        });
      }

      // Handle other types of errors
      return response.json({
        success: false,
        message: "An unexpected error occurred",
        error: error.message,
      });
    }
  }

  // Update an item by ID
  async update(request, response) {
    const { id } = request.params;
    try {
      const body = request.body; // For PATCH, use body instead of json()
      console.log({ body, id }, "===update");
      await this.model.updateOne({ _id: id }, { $set: body });
      const data = await this.model.findOne({ _id: id })?.lean();
      return response.json({
        success: true,
        message: "Item successfully updated",
        details: data,
      });
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: error.message });
    }
  }
}

// Factory function to create an instance of the controller with the provided model
const resources = (model) => {
  const controller = new ResourceController(model);
  return {
    single: controller.single.bind(controller),
    delete: controller.delete.bind(controller),
    list: controller.list.bind(controller),
    create: controller.create.bind(controller),
    update: controller.update.bind(controller),
  };
};

module.exports = { resources };
