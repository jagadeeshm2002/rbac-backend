import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

import { rolePermissionsValid } from "../middlewares/rolePermissionsValid";
import validate from "../middlewares/validate";
import {
  zdeleteUser,
  zgetAllUsers,
  zgetUserById,
  zupdateUserSchema,
  zuserAddSchema,
} from "../utils/zod";

const router = Router();

router.get(
  "/",
  rolePermissionsValid(["admin"], "read"),
  validate(zgetAllUsers),
  getAllUsers
);
router.post(
  "/",
  rolePermissionsValid(["admin"], "create"),
  validate(zuserAddSchema),
  addUser
);
router.get(
  "/:id",
  rolePermissionsValid(["admin"], "read"),
  validate(zgetUserById),
  getUserById
);
router.put(
  "/:id",
  rolePermissionsValid(["admin"], "update"),
  validate(zupdateUserSchema),
  updateUser
);
router.delete(
  "/:id",
  rolePermissionsValid(["admin"], "delete"),
  validate(zdeleteUser),
  deleteUser
);

export default router;
