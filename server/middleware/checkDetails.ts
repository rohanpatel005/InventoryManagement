import { Request, Response, NextFunction } from "express";
import { Products } from "../entities/product";

export const validateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);

  const {name,category,quantity, mrp, selling_price,  discount, sku,} = req.body;
  if (!name ||!category ||!sku ||quantity === undefined || mrp === undefined || selling_price === undefined || discount === undefined) {
    return res.status(400).json({
      message: "All the fields are compulsory",
    });
  }

 
  const product = await Products.findOneBy({ sku });

  if (product) {
    return res.status(400).json({
      message: "Product with the same SKU already exists",
    });
  }
  else{
  next();
  }
};
