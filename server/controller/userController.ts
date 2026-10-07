
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
const apiKey = process.env.API_KEY;

const jwt=jsonwebtoken

export const createUser = async (
  req: Request,
  res: Response
) => {

    const { name, number, email, password, address,role } = req.body;
    const aUser=await Users.findOneBy({email})
    if(aUser){
        return res.status(400).json({
        message: "User already exits",
    })
    }
   bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
    const User=  Users.create({name,number:number,email,password:hash,address,role})
    await User.save()
    const secret = process.env.SECRET;
    if (!secret) {
     throw new Error("SECRET is not defined in .env");
     }
    const id=User.id
    const token = jwt.sign({id,email,role }, secret,{expiresIn: "15m"});
    res.cookie("token",token)
    return res.status(201).json({
      message: "User created successfully",
    });
});
    
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

  const user = await Users.findOneBy({
    id: userId,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Validate product ID and quantity
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

  const productIds = items.map(
    (item: { productId: number; quantity: number }) =>
      item.productId
  );

  const products = await Products.find({
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

  let totalPrice = 0;

  const orderItems = items.map(
    (item: { productId: number; quantity: number }) => {
      const product = products.find(
        (product) => product.id === item.productId
      );

      if (!product) {
        throw new AppError(
          "Product not found",
          404
        );
      }

      if (product.quantity < item.quantity) {
        throw new AppError(
          "Insufficient stock",
          400
        );
      }

      // Calculate price for this item
      totalPrice +=
        Number(product.selling_price) * item.quantity;

      // Reduce stock
      product.quantity -= item.quantity;

      return {
        product,
        quantity: item.quantity,
        price: product.selling_price,
      };
    }
  );

  // Save updated product quantities
  await Products.save(products);

  // Create order
  const order = new Orders();

  order.user = user;
  order.items = orderItems as OrderItem[];
  order.status = Status.ACCEPTED;
  order.totalPrice = totalPrice;

  const result = await order.save();

  if (!result) {
    throw new AppError(
      "Error in placing the order",
      500
    );
  }

  return res.status(201).json({
    message: "Order placed successfully",
    order,
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