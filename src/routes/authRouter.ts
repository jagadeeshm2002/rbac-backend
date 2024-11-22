import { Router } from "express";
import { signin, refresh } from "../controllers/authController";
import validate from "../middlewares/validate";
import { signinSchema } from "../utils/zod";

const router = Router();

router.post("/", validate(signinSchema), signin);
router.post("/refresh", refresh);

export default router;
