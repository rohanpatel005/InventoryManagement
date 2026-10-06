
import { NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken"
import { Role } from "../entities/user";
import {Request,Response} from "express"
const jwt=jsonwebtoken



export enum Permission {
  USER_READ = "user:read",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  ORDER_READ = "order:read",
  ORDER_CREATE = "order:create",
  ORDER_UPDATE = "order:update",
  ORDER_DELETE = "order:delete",

  PRODUCT_READ = "product:read",
  PRODUCT_CREATE = "product:create",
  PRODUCT_UPDATE = "product:update",
  PRODUCT_DELETE = "product:delete",
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),

  [Role.MANAGER]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_CREATE,
    Permission.USER_DELETE,
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,

    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
  ],

  [Role.USER]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
    Permission.PRODUCT_READ,
  ],
};
export const roleverify = (requiredPermission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.role;

    if (!role) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const permissions = RolePermissions[role];

    if (!permissions) {
      return res.status(403).json({
        message: "Invalid role",
      });
    }

    if (permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({
      message: "You are not authorized to perform this action",
    });
  };
};
