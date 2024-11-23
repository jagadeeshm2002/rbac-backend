import { Router } from "express";
import { signin, refresh } from "../controllers/authController";
import validate from "../middlewares/validate";
import { zsigninSchema } from "../utils/zod";

const router = Router();

router.post("/", validate(zsigninSchema), signin);
router.post("/refresh", refresh);

export default router;
