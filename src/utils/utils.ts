import { exportUserQuery } from "./types";

export function prepareUserExportData(users: exportUserQuery[]) {
  return users.map((user) => {
    const flatUser: Record<string, any> = {};

    // Explicitly handle known fields
    flatUser._id = user._id;
    flatUser.username = user.username;
    flatUser.email = user.email;
    flatUser.isActive = user.isActive;
    flatUser.createdAt = user.createdAt;
    flatUser.updatedAt = user.updatedAt;

    // Handle role permissions
    if (user.role) {
      flatUser.roleName = user.role.name;
      flatUser.rolePermissions = JSON.stringify(user.role.permissions);
    }

    return flatUser;
  });
}
