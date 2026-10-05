import { Users } from './../entities/user';
import { NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken"
import { Role } from "../entities/user";
import {Request,Response} from "express"
const jwt=jsonwebtoken

interface JwtPayload {
  email: string;
  role: Role;
}

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
export const roleverify = (requiredPermission: Permission)=> {
  return (req:Request,res:Response,next:NextFunction)=>{
   const secret = process.env.SECRET;
    if (!secret) {
     throw new Error("SECRET is not defined in .env");
     }
    const token = req.cookies.token
    const decoded = jwt.verify(token, secret) as JwtPayload;

   
    if (typeof decoded === "object" && decoded !== null) {
      const role = decoded.role;
      const permissions = RolePermissions[role];
      console.log(permissions)
      if(permissions.includes(requiredPermission)){
        next()
      } 
      else{
        return res.status(400).json({message:"Unauthorize to perform the action"})
      }
    }
  }
}
