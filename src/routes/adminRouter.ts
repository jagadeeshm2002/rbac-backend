import { Router } from "express";
import {
  addNewRole,
  exportUsersToCsv,
  getAllRoles,
  getStats,
  updateRole,
} from "../controllers/adminController";
import { rolePermissionsValid } from "../middlewares/rolePermissionsValid";
import validate from "../middlewares/validate";
import {
  zaddNewRole,
  zexportUsersToCsv,
  zgetAllRoles,
  zgetStats,
  zupdateRole,
} from "../utils/zod";

const router = Router();

router.get(
  "/getusercsv",
  rolePermissionsValid(["admin"], "read"),
  validate(zexportUsersToCsv),
  exportUsersToCsv
);
router.get(
  "/stats",
  rolePermissionsValid(["admin"], "read"),
  validate(zgetStats),
  getStats
);
router.post(
  "/role",
  rolePermissionsValid(["admin"], "create"),
  validate(zaddNewRole),
  addNewRole
);
router.put(
  "/role/:id",
  // rolePermissionsValid(["admin"], "update"),
  validate(zupdateRole),
  updateRole
);
router.get(
  "/role",
  rolePermissionsValid(["admin"], "read"),
  validate(zgetAllRoles),
  getAllRoles
);

export default router;
