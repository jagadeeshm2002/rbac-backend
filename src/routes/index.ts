import { Router } from "express";
import authRouter from "./authRouter"
import adminRouter from "./adminRouter"
import userRouter from "./userRouter"


const router = Router();


router.all("/auth",authRouter)
router.all("/admin",adminRouter)
router.all("/users",userRouter)


export default router