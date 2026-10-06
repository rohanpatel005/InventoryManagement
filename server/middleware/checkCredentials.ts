import { Request, Response, NextFunction } from "express";

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, number, email, password, address } = req.body;


  if (!name || !number || !email || !password || !address) {
    return res.status(400).json({
      message: "All the fields are required",
    }).redirect('/');
  }

  if (name.length < 2) {
    return res.status(400).json({
      message: "Name should be at least 2 characters long",
    }).redirect('/');
  }

  if (!/^[6-9]\d{9}$/.test(String(number))) {
    return res.status(400).json({
      message: "Number should be a valid 10-digit mobile number",
    }).redirect('/');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({
    message: "Invalid email address",
  }).redirect('/');
}
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password should be at least 8 characters long",
    }).redirect('/');
  }

  next();
};
