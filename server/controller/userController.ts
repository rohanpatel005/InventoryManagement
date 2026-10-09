
import { Users } from './../entities/user';

import { Request, Response } from "express";

import bcrypt from "bcrypt"; 
import jsonwebtoken from"jsonwebtoken";
import { Products } from "../entities/product";
import { In } from 'typeorm';
import { Orders } from "../entities/order";
import { OrderItem } from "../entities/orderItem";
import { Status } from '../entities/order';
import { getPagination } from '../utils/pagination';
import { AppError } from "../utils/appError";
import { AppDataSource } from "../server";
const jwt=jsonwebtoken

export const createUser = async (
  req: Request,
  res: Response
) => {

    const { name, number, email, password, address} = req.body;
    const aUser=await Users.findOneBy({email})
    if(aUser){
        return res.status(400).json({
        message: "User already exits",
    })
    }
   const secret = process.env.SECRET;

if (!secret) {
    throw new Error("SECRET is not defined in .env");
}

const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

const user = await Users.create({
    name,
    number,
    email,
    password: hash,
    address,
   
});

const token = jwt.sign(
    { id: user.id, email, role:"user" },
    secret,
    { expiresIn: "15m" }
);

res.cookie("token", token);
return res.status(201).json({
    message: "User created successfully",
});

};
export const updateUser = async (req: Request, res: Response) => {

    const { name, number, password, address } = req.body;

    const token=req.cookies.token
    
const id=req.id
    const user = await Users.findOneBy({ id });

    if(!user){
      throw new AppError("user not found",404)
    }

    const hash = await bcrypt.hash(password, 10);
    
    const result = await Users.update(
      { id },
      {
        name,
        number,
        
        password: hash,
        address,
      }
    );
      if(result.affected==0){
      throw new AppError("Update failed",400)
    }


    return res.status(200).json({
      message: "User updated successfully",
    });

};

export const deleteUser=async(req:Request,res:Response)=>{ 

  const id=req.id
  

 const result = await Users.delete({ id });



if (result.affected === 0) {
  throw new AppError("User not found", 404);
}
  res.clearCookie("token")
  return res.status(200).json({message:"User Deleted Successfully"}).redirect("/")

}

export const logout=async(req:Request,res:Response)=>{
    res.cookie("token","")
    res.status(200).json({message:"Logout Successfully"})   
}
export const login=async(req:Request,res:Response)=>{
  const {email,password}=req.body

    const user=await Users.findOneBy({email})
    if(!user){
      throw new AppError("user not registered",404)
    }
    else{
      const upassword=user.password
      const role=user.role

      bcrypt.compare(password,upassword,(err,result)=>{
        if(result){
          const secret = process.env.SECRET;
        if (!secret) {
          throw new AppError("SECRET is not defined in .env",500);
        }
          const id=user.id
          const token = jwt.sign({id,email,role}, secret);
          res.cookie("token",token)  
          res.status(200).json({message:"User Logged in Successfully"}) 
        }
        else{
           res.status(400).json({message:"Invalid credentials"})
        }
      })
    }
  }
  
export const placeProduct = async (
  req: Request,
  res: Response
) => {
  const { items } = req.body;
  const userId = req.id;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Items are required", 400);
  }

  for (const item of items) {
    if (
      !Number.isInteger(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.productId <= 0 ||
      item.quantity <= 0
    ) {
      throw new AppError(
        "Invalid product ID or quantity",
        400
      );
    }
  }

  const result = await AppDataSource.transaction(
    async (manager) => {
      const user = await manager.findOne(Users, {
        where: { id: userId },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const productIds = [
        ...new Set(
          items.map(
            (item: {
              productId: number;
              quantity: number;
            }) => item.productId
          )
        ),
      ];

      const products = await manager.find(Products, {
        where: {
          id: In(productIds),
        },
      });

      if (products.length !== productIds.length) {
        throw new AppError(
          "One or more products not found",
          400
        );
      }

      const productMap = new Map(
        products.map((product) => [
          product.id,
          product,
        ])
      );

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new AppError(
            "Product not found",
            404
          );
        }

        const updateResult = await manager
          .createQueryBuilder()
          .update(Products)
          .set({
            quantity: () =>
              `"quantity" - :quantity`,
          })
          .where("id = :productId", {
            productId: item.productId,
          })
          .andWhere("quantity >= :quantity")
          .setParameter("quantity", item.quantity)
          .execute();

        if (updateResult.affected !== 1) {
          throw new AppError(
            "Insufficient stock",
            400
          );
        }

        totalPrice +=
          Number(product.selling_price) *
          item.quantity;
        const orderItem = manager.create(OrderItem, {
            product,
            quantity: item.quantity,
            price: Number(product.selling_price),
          });

          orderItems.push(orderItem);
      }

      const order = manager.create(Orders, {
        user,
        items: orderItems,
        status: Status.ACCEPTED,
        totalPrice,
      });

      const savedOrder = await manager.save(
        Orders,
        order
      );

      if (!savedOrder) {
        throw new AppError(
          "Error in placing the order",
          500
        );
      }

      return savedOrder;
    }
  );

  return res.status(201).json({
    message: "Order placed successfully",
    order: result,
  });
};
export const viewOrder = async (
  req: Request,
  res: Response
) => {
  const userId = req.id;

  const { page, limit, skip } = getPagination(
    req.query.page,
    req.query.limit
  );

  const [orders, total] = await Orders.findAndCount({
    where: {
      user: {
        id: userId,
      },
    },

    relations: {
      items: {
        product: true,
      },
    },

    skip,
    take: limit,

    order: {
      id: "DESC",
    },
  });

  return res.status(200).json({
    data: orders,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const cancelOrder = async (
  req: Request,
  res: Response
) => {
  const uid = req.id;
  const  oid  = req.params.id;

  const order = await Orders.findOne({
    where: {
      id: Number(oid),
    },
    relations: {
      user: true,
      items: {
        product: true,
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.user.id !== uid) {
    throw new AppError(
      "You cannot cancel this order",
      403
    );
  }

  if (order.status === Status.CANCELLED) {
    throw new AppError(
      "Order is already cancelled",
      400
    );
  }

  for (const item of order.items) {
    item.product.quantity += item.quantity;
  }

  
  await Products.save(
    order.items.map((item) => item.product)
  );

  order.status = Status.CANCELLED;

  await order.save();

  return res.status(200).json({
    message: "Order cancelled successfully",
  });
};

export const addToCart = async ( req: Request,res: Response) => {
  
    const userId = req.id;
    const productId = Number(req.body.pid);

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const user = await Users.findOne({
      where: {
        id: userId,
      },
      relations: {
        products: true,
      },
    });

    if (!user) {
      throw new AppError("User not found",404)
    }

    const product = await Products.findOneBy({
      id: productId,
    });

    if (!product) {
     throw new AppError("Product not found",404)
    }

    const alreadyInCart = user.products.some(
      (item) => item.id === product.id
    );

    if (alreadyInCart) {
      return res.status(400).json({
        message: "Product   acdflready in cart",
      });
    }

    user.products.push(product);

    await user.save();

    return res.status(200).json({
      message: "Product added to cart successfully",
    });
};
export const viewCart = async (
  req: Request,
  res: Response
) => {
 
    const userId = req.id;

    const user = await Users.findOne({where: {  id: userId,},relations: {  products: true,},});
    if (!user) {
      throw new AppError("User not found",404)
    }
  return res.status(200).json({cart: user.products, });
 
};