import { Request, Response, NextFunction } from "express";
import { Products } from "../entities/product";
import { AppError } from "../utils/appError";

export const validateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);

  const {
    name,
    category,
    quantity,
    mrp,
    selling_price,
    discount,
    sku,
  } = req.body;

  if (
    !name ||
    !category ||
    !sku ||
    quantity === undefined ||
    mrp === undefined ||
    selling_price === undefined ||
    discount === undefined
  ) {
    throw new AppError(
      "All the fields are compulsory",
      400
    );
  }

  const product = await Products.findOneBy({ sku });

  if (product) {
    throw new AppError(
      "Product with the same SKU already exists",
      400
    );
  }

  next();
};
