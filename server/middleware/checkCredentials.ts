import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    number,
    email,
    password,
    address,
  } = req.body;

  if (!name || !number || !email || !password || !address) {
    throw new AppError(
      "All the fields are required",
      400
    );
  }

  if (name.length < 2) {
    throw new AppError(
      "Name should be at least 2 characters long",
      400
    );
  }

  if (!/^[6-9]\d{9}$/.test(String(number))) {
    throw new AppError(
      "Number should be a valid 10-digit mobile number",
      400
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError(
      "Invalid email address",
      400
    );
  }

  if (password.length < 8) {
    throw new AppError(
      "Password should be at least 8 characters long",
      400
    );
  }

  next();
};
