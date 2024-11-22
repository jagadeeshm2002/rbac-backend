import { model, Schema } from "mongoose";
import { IUser } from "../utils/types";
import { RolePermissions } from "./rolePermissions.schema";

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role:RolePermissions,
    isActive: {
        type: Boolean,
        default: true,
    },
})

export const User = model<IUser>("User", userSchema);