import { Router } from "express";
import authRouter from "./authRouter"
import adminRouter from "./adminRouter"
import userRouter from "./userRouter"
import { verifyJwt } from "../middlewares/verifyJwt";


const router = Router();

router.get("/",(req, res) => res.send("Hello World!"));
router.use("/auth",authRouter)
router.use("/admin",verifyJwt,adminRouter)
router.use("/users",verifyJwt,userRouter)


export default router