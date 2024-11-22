import { Router } from "express";

const router = Router();

router.get("/", getAllUsers);
router.post("/", addUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
