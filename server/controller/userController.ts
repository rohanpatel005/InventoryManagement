
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
    const User=  Users.create({name,number,email,password:hash,address,role})
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

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
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



    return res.status(200).json({
      message: "User updated successfully",
    });

};

export const deleteUser=async(req:Request,res:Response)=>{ 

  const id=req.id
  

  const aUser = await Users.findOneBy({ id });

  if (!aUser) {
    return res.status(404).json({
      message: "User not found",
    })
  }
  await Users.delete({id})
  res.cookie("token","")
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
     return res.status(400).json({message:"User not register"})
    }
    else{
      const upassword=user.password
      const role=user.role

      bcrypt.compare(password,upassword,(err,result)=>{
        if(result){
          const secret = process.env.SECRET;
        if (!secret) {
          throw new Error("SECRET is not defined in .env");
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
  

export const placeProduct = async (req: Request, res: Response) => {

    const { items } = req.body;
    const id = req.id;
    const user = await Users.findOneBy({id});
    if (!user) {
    return res.status(404).json({message: "User not found"});
  }
    const productIds = items.map((item: { productId: number; quantity: number }) => item.productId);
    const products = await Products.find({where: {id: In(productIds) },
    });
  if (products.length !== productIds.length) {return res.status(400).json({message: "One or more products not found"});
    }
const orderItems = items.map((item: { productId: number; quantity: number }) => {const product = products.find((product) => product.id === item.productId
        );
return {
          product: product!,
          quantity: item.quantity,
          price: product!.selling_price,
        };
      }
    );
const order = new Orders();
 order.user = user; 
 order.items = orderItems as OrderItem[];
 order.status = Status.ACCEPTED;
await order.save();
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
    const { oid } = req.body;

    const order = await Orders.findOne({where: {id: Number(oid),},relations: {user: true,},
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.id !== uid) {
      return res.status(403).json({
        message: "You cannot cancel this order",
      });
    }

    if (order.status === Status.CANCELLED) {
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

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
      return res.status(404).json({
        message: "User not found",
      });
    }

    const product = await Products.findOneBy({
      id: productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
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
      return res.status(404).json({
        message: "User not found",
      });
    }
  return res.status(200).json({cart: user.products, });
 
};