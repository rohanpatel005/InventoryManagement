import { Request, Response } from "express";
import { Users } from "../entities/user";
import { Products } from "../entities/product";
import { error } from "node:console";
export const createProduct=async(req:Request,res:Response)=>{
    const {name,category,quantity,mrp,selling_price,discount,sku} =req.body
    try{
        const product=Products.create({name,category,quantity,mrp,selling_price,discount,sku})
        await product.save()
        return res.status(201).json({message:"Product created successfully"})
    }
    catch(err){
        console.log(err)
    }
}
export const updateProduct=async(req:Request,res:Response)=>{
    const{name,category,quantity,mrp,selling_price,discount,sku}=req.body
    const id=req.params
    if (  !name || !category || !sku || quantity === undefined || mrp === undefined || selling_price === undefined || discount === undefined
  ) {
    return res.status(400).json({
      message: "All the fields are compulsory",
    });
  }
    try{
        
        const product= await Products.update({sku},{name,category,quantity,mrp,selling_price,discount})
        return res.status(201).json({message:"Product updated successfully"})
    }
    catch(err){
        console.log("errororro")
        console.log(err)
    }
}
export const deleteProduct=async(req:Request,res:Response)=>{
    const uid=req.id
    try{
    const {pid}=req.body
    const product=await Products.delete({id:Number(pid)})
    res.status(200).json({message:"Deleted Successfully"})
    }
    catch(err){
        res.send(err)
    }
}