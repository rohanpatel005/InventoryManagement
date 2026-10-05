import { addToCart, cancelOrder, placeProduct, viewCart, viewOrder } from './../controller/userController';
import { Permission } from './../middleware/auth';

import express from "express"


import { createUser ,deleteUser,login,logout,updateUser} from "../controller/userController";
import { validateUser } from "../middleware/checkCredentials";
import { roleverify } from "../middleware/auth";
import { isLogggedIn } from '../middleware/isLoggedIn';

const router=express.Router()

router.post("/api/createuser",validateUser,createUser)
router.post("/api/updateuser/",isLogggedIn,roleverify(Permission.USER_UPDATE),updateUser)

router.delete("/api/deleteuser/",isLogggedIn,roleverify(Permission.USER_DELETE),deleteUser)
router.post("/api/login",login)
router.get("/api/logout",logout)
router.post("/api/placeorder/",isLogggedIn,placeProduct)
router.get("/api/vieworder/",isLogggedIn,viewOrder)
router.post("/api/addtocart/",isLogggedIn,addToCart)
router.get("/api/viewcart/",isLogggedIn,viewCart)
export{router as userRouter}