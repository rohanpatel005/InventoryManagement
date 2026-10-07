import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Product name is required",
      "string.min":
        "Product name must be at least 2 characters long",
      "string.max":
        "Product name cannot exceed 100 characters",
      "any.required": "Product name is required",
    }),

  sku: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "SKU is required",
      "string.min": "SKU must be at least 2 characters long",
      "string.max": "SKU cannot exceed 50 characters",
      "any.required": "SKU is required",
    }),

  category: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Category is required",
      "string.min":
        "Category must be at least 2 characters long",
      "string.max":
        "Category cannot exceed 50 characters",
      "any.required": "Category is required",
    }),

  mrp: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "MRP must be a number",
      "number.positive": "MRP must be greater than 0",
      "any.required": "MRP is required",
    }),

  selling_price: Joi.number()
    .positive()
    .max(Joi.ref("mrp"))
    .required()
    .messages({
      "number.base": "Selling price must be a number",
      "number.positive":
        "Selling price must be greater than 0",
      "number.max":
        "Selling price cannot be greater than MRP",
      "any.required": "Selling price is required",
    }),

  discount: Joi.number()
    .min(0)
    
    .required()
    .messages({
      "number.base": "Discount must be a number",
      "number.min": "Discount cannot be less than 0",
      "number.max": "Discount cannot be greater than 100",
      "any.required": "Discount is required",
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be a whole number",
      "number.min": "Quantity cannot be negative",
      "any.required": "Quantity is required",
    }),
});
