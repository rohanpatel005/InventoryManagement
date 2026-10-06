import { roleverify } from './auth';
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

interface MyJwtPayload extends JwtPayload {
  id: number;
}

export const isLogggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login First",
    });
  }


  const secret = process.env.SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "SECRET is not defined in .env",
    });
  }

  jwt.verify(
    token,
    secret,
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {

      if (err) {
        return res.status(401).json({
          message: "Please login",
        });
      }


      if (!decoded || typeof decoded === "string") {
        return res.status(400).json({
          message: "Invalid token",
        });
      }


      const payload = decoded as MyJwtPayload;

      const id=payload.id
      req.id  = id;
      const role=payload.role
      req.role=role
  
      next();
    }
  );
};
