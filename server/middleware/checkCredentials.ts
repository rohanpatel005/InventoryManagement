import { Request, Response, NextFunction } from "express";
import { createUserSchema } from "../validations/userValidations";
import { AppError } from "../utils/appError";

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createUserSchema.validate(req.body);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  next();
};
