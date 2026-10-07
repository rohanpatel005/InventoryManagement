import { addToCart, cancelOrder, placeProduct, viewCart, viewOrder } from './../controller/userController';
import { Permission } from './../middleware/auth';

import express from "express"


import { createUser ,deleteUser,login,logout,updateUser} from "../controller/userController";
import { validateUser } from "../middleware/checkCredentials";
import { roleverify } from "../middleware/auth";
import { isLogggedIn } from '../middleware/isLoggedIn';
import { asyncHandler } from "../middleware/asyncHandler";
const router=express.Router()

router.post("/api/user",validateUser,createUser)
router.put("/api/user/:id",isLogggedIn,roleverify(Permission.USER_UPDATE),asyncHandler(updateUser))

router.delete("/api/user/:id",isLogggedIn,roleverify(Permission.USER_DELETE),asyncHandler(deleteUser))
router.post("/api/login",asyncHandler(login))
router.get("/api/logout",asyncHandler(logout))
router.post("/api/order/",isLogggedIn,asyncHandler(placeProduct))
router.post("/api/order/:id/cancel",isLogggedIn,asyncHandler(cancelOrder))
router.get("/api/order/",isLogggedIn,asyncHandler(viewOrder))
router.post("/api/cart/",isLogggedIn,asyncHandler(addToCart))
router.get("/api/cart/",isLogggedIn,asyncHandler(viewCart))
export{router as userRouter}