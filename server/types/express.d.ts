import { Role } from "../entities/user";

declare global {
  namespace Express {
    interface Request {
      id?: number;
      role?:Role
    }
  }
}

export {};
