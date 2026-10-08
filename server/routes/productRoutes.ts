import express from "express"
import { validateProduct } from "../middleware/checkDetails";
import { roleverify } from "../middleware/auth";
import { isLogggedIn } from '../middleware/isLoggedIn';
import { Permission } from "../middleware/auth";
import { createProduct, deleteProduct, updateProduct, viewProduct } from "../controller/productController";
const router=express.Router()
import { asyncHandler } from "../middleware/asyncHandler";
router.post("/api/product",isLogggedIn,roleverify(Permission.PRODUCT_CREATE),validateProduct,asyncHandler(createProduct))
router.put("/api/product/:id",isLogggedIn,roleverify(Permission.PRODUCT_UPDATE),asyncHandler(updateProduct))
router.delete("/api/product/:id",isLogggedIn,roleverify(Permission.PRODUCT_DELETE),asyncHandler(deleteProduct))
router.get("/api/product",isLogggedIn,asyncHandler(viewProduct))
export{router as productRouter}