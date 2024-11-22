export type role = "admin" | "user" | "guest" | "manager" | "developer";
export type persmissions = "create" | "read" | "update" | "delete";
export type isActive = true | false;

export interface IRolePermissions {
  name: role;
  permissions: persmissions[];
  isActive: isActive;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: role;
  isActive: isActive;
}

export type jwtPayload = Pick<IUser, "email" | "role">;
