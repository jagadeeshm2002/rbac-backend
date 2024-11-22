import { Schema, model } from "mongoose";
import { IRolePermissions } from "../utils/types";

const roleSchema = new Schema<IRolePermissions>({
  name: {
    type: String,
    required: true,
  },
  permissions: {
    type: [String],
    required: true,
  },
  isActive: { type: Boolean, default: true },
});

export const RolePermissions = model<IRolePermissions>(
  "RolePermissions",
  roleSchema
);
