import  jsonwebtoken  from 'jsonwebtoken';

import { Users } from './../entities/user';

import { Request, Response } from "express";

import bcrypt from "bcrypt"; 
const jwt=jsonwebtoken
export const createManager = async (
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