import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { AppError } from "../utils/appError";
import { Role } from "../entities/user";


interface MyJwtPayload extends JwtPayload {
  id: number;
  role: Role;
}

export const isLogggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    throw new AppError(
      "Please login first",
      401
    );
  }

  const secret = process.env.SECRET;

  if (!secret) {
    throw new AppError(
      "SECRET is not defined in .env",
      500
    );
  }

  jwt.verify(
    token,
    secret,
    (
      err: VerifyErrors | null,
      decoded: string | JwtPayload | undefined
    ) => {
      if (err) {
        throw new AppError(
          "Please login",
          401
        );
      }

      if (!decoded || typeof decoded === "string") {
        throw new AppError(
          "Invalid token",
          400
        );
      }

      const payload = decoded as MyJwtPayload;

      req.id = payload.id;
      req.role = payload.role;

      next();
    }
  );
};
