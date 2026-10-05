import express from "express"
import { validateProduct } from "../middleware/checkDetails";
import { roleverify } from "../middleware/auth";
import { isLogggedIn } from '../middleware/isLoggedIn';
import { Permission } from "../middleware/auth";
import { createProduct, deleteProduct, updateProduct } from "../controller/productController";
const router=express.Router()

router.post("/api/createproduct",isLogggedIn,roleverify(Permission.PRODUCT_CREATE),validateProduct,createProduct)
router.post("/api/updateproduct/:id",isLogggedIn,roleverify(Permission.PRODUCT_UPDATE),updateProduct)
router.post("/api/deleteproduct/",isLogggedIn,roleverify(Permission.PRODUCT_DELETE),deleteProduct)
export{router as productRouter}