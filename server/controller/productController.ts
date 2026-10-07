import { Request, Response } from "express";
import { Products } from "../entities/product";
import { AppError } from "../utils/appError";

export const createProduct = async (
  req: Request,
  res: Response
) => {
  const {name,category, quantity, mrp, selling_price, discount, sku,} = req.body;
if (    !name ||!category ||  !sku ||quantity === undefined ||mrp === undefined ||selling_price === undefined ||discount === undefined ) {
    throw new AppError("All fields are required", 400);
  }

  const product = Products.create({
    name,
    category,
    quantity,
    mrp,
    selling_price,
    discount,
    sku,
  });

  await product.save();

  return res.status(201).json({
    message: "Product created successfully",
    product,
  });
};

export const updateProduct = async (
  req: Request,
  res: Response
) => {
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
    throw new AppError("All fields are required", 400);
  }

  const result = await Products.update(
    { sku },
    {
      name,
      category,
      quantity,
      mrp,
      selling_price,
      discount,
    }
  );

  if (result.affected === 0) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    message: "Product updated successfully",
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  const productId = Number(req.body.pid);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new AppError("Invalid product ID", 400);
  }

  const result = await Products.delete({
    id: productId,
  });

  if (result.affected === 0) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    message: "Product deleted successfully",
  });
};
