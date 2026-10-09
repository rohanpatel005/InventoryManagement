import express from "express"
import { validateProduct } from "../middleware/checkDetails";
import { roleverify } from "../middleware/auth";
import { isLogggedIn } from '../middleware/isLoggedIn';
import { Permission } from "../middleware/auth";
const router=express.Router()
import { asyncHandler } from "../middleware/asyncHandler";
import { createManager } from "../controller/adminController";
router.post("/api/product",isLogggedIn,roleverify(Permission.ADMIN_CREATE),asyncHandler(createManager))