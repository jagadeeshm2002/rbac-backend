import { Document, FilterQuery, Types } from "mongoose";
export type role = "admin" | "user" | "guest" | "manager" | "developer";
export type permissions = "create" | "read" | "update" | "delete";
export type isActive = true | false;


export interface IRolePermissions {
  name: role;
  permissions: permissions[];
  isActive?: isActive;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: IRolePermissions;
  isActive: isActive;
}
export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export interface IRolePermissionsDocument extends IRolePermissions, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type jwtPayload = Pick<IUser, "email" | "role" | "username">;

export interface customRequest extends Request {
  user: jwtPayload;
}

export interface getAllUserQuery extends FilterQuery<IUser> {
  $or?: [
    { username: { $regex: string; $options: "i" } },
    { email: { $regex: string; $options: "i" } }
  ];
  role?: string;
  isActive?: string | boolean;
}

export interface updateUserBody {
  username?: string;
  email?: string;
  isActive?: isActive;
  role?: string;
}

export interface exportUserQuery extends IUser {
  _id: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
