import Joi from "joi";
import { Role } from "../entities/user";

export const createUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 50 characters",
    }),

  number: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base":
        "Number should be a valid 10-digit mobile number",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email":
        "Please provide a valid email address",
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min":
        "Password must be at least 8 characters long",
      "string.max":
        "Password cannot exceed 100 characters",
    }),

  address: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      "string.empty": "Address is required",
      "string.min":
        "Address must be at least 5 characters long",
      "string.max":
        "Address cannot exceed 255 characters",
    }),

  })