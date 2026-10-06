import { addToCart, cancelOrder, placeProduct, viewCart, viewOrder } from './../controller/userController';
import { Permission } from './../middleware/auth';

import express from "express"


import { createUser ,deleteUser,login,logout,updateUser} from "../controller/userController";
import { validateUser } from "../middleware/checkCredentials";
import { roleverify } from "../middleware/auth";
import { isLogggedIn } from '../middleware/isLoggedIn';

const router=express.Router()

router.post("/api/user",validateUser,createUser)
router.put("/api/user/:id",isLogggedIn,roleverify(Permission.USER_UPDATE),updateUser)

router.delete("/api/user/:id",isLogggedIn,roleverify(Permission.USER_DELETE),deleteUser)
router.post("/api/login",login)
router.get("/api/logout",logout)
router.post("/api/order/",isLogggedIn,placeProduct)
router.get("/api/order/",isLogggedIn,viewOrder)
router.post("/api/cart/",isLogggedIn,addToCart)
router.get("/api/cart/",isLogggedIn,viewCart)
export{router as userRouter}