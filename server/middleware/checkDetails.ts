import { Request, Response, NextFunction } from "express";
import { Products } from "../entities/product";
import { AppError } from "../utils/appError";
import { createProductSchema } from "../validations/productValidations";

export const validateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createProductSchema.validate(req.body);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  const { sku } = req.body;

  const product = await Products.findOneBy({ sku });

  if (product) {
    throw new AppError(
      "Product with the same SKU already exists",
      400
    );
  }

  next();
};
