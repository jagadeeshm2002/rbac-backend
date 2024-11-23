import { User } from "../models/user.schema";
import { Response, Request } from "express";
import {
  getAllUserQuery,
  IRolePermissionsDocument,
  IUser,
  IUserDocument,
  updateUserBody,
} from "../utils/types";
import { RolePermissions } from "../models/rolePermissions.schema";
import bcrypt from "bcrypt";
import { populate } from "dotenv";

const salt = 10; // thinK has globel

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    let query: getAllUserQuery = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (isActive) query.isActive = isActive === "true";
    const users = await User.find<IUser>(query)
      .populate("role")
      .skip(skip)
      .limit(limit)
      .select("-password")
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    return res.status(200).json({
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await User.findById<IUser>(id)
      .populate("role")
      .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role: roleName } = req.body;
    if (!username || !email || !password || !roleName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne<IUserDocument>({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const role = await RolePermissions.findOne<IRolePermissionsDocument>({
      name: roleName,
    });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      username: username.toLowerCase(),
      email,
      password: hashedPassword,
      role: role._id,
    });

    return res.status(201).json({
      message: "user successfully created",
      user: { username: newUser.username, email: newUser.email },
    });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const updateUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      isActive,
      role: roleName,
    }: updateUserBody = req.body;
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById<IUserDocument>(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (roleName) {
      const role = await RolePermissions.findOne<IRolePermissionsDocument>({
        name: roleName,
      });
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
    }

    if (email && email !== user.email) {
      const emailInUse = await User.findOne<IUserDocument>({
        email,
        _id: { $ne: user._id },
      });
      if (emailInUse) {
        return res.status(409).json({ message: "Email is already in use" });
      }
    }

    if (username && username !== user.username) {
      const usernameInUse = await User.findOne<IUserDocument>({
        username,
        _id: { $ne: user._id },
      });
      if (usernameInUse) {
        return res.status(409).json({ message: "Username is already in use" });
      }
    }
    if (isActive == user.isActive) {
      return res.status(409).json({ message: `user already ${isActive}` });
    }

    const role = roleName
      ? await RolePermissions.findOne<IRolePermissionsDocument>({
          name: roleName,
        })
      : null;

    const updatedUser = await User.findByIdAndUpdate<IUserDocument>(
      userId,
      { username, email, isActive: isActive, role: role?._id },
      { new: true }
    );

    const populatedUser = updatedUser && (await updatedUser.populate("role"));

    return res
      .status(200)
      .json({ message: "User successfully updated", populatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete<IUserDocument>(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getAllUsers, getUserById, addUser, updateUser, deleteUser };
