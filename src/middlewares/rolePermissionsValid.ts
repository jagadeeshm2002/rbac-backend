import { Request, Response, NextFunction } from "express";
import {
  customRequest,
  IRolePermissions,
  permissions,
  role,
} from "../utils/types";
export const rolePermissionsValid = (
  allowedRoles: role[],
  allowedPermissions: permissions
) => {
  return async (
    req: Request | customRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Type guard to check if req has user property
      if (!("user" in req)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log(req.user.role);

      const userRole = req.user.role;
      const hasValidRole = allowedRoles.includes(userRole.name);
      const hasPermission = userRole.permissions.includes(allowedPermissions);

      if (!hasValidRole || !hasPermission) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Permission check failed" });
    }
  };
};
