import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { json2csv } from "json-2-csv";
import {
  IRolePermissions,
  IRolePermissionsDocument,
  IUserDocument,
} from "../utils/types";
import { RolePermissions } from "../models/rolePermissions.schema";

interface FlattenedUser {
  _id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roleName: string;
  rolePermissions: string;
}

const prepareUserExportData = (users: IUserDocument[]): FlattenedUser[] => {
  return users.map((user) => ({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roleName: user.role?.name || "N/A",
    rolePermissions: user.role
      ? JSON.stringify(user.role.permissions)
      : "No Permissions",
  }));
};

const exportUsersToCsv = async (req: Request, res: Response) => {
  try {
    // Optional query parameters for filtering
    const { isActive, role, startDate, endDate } = req.query;

    // Construct dynamic query
    const query: any = {};
    if (isActive) query.isActive =isActive === "true";
    if (role) query["role.name"] = role;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Fetch users with optional filtering
    const users = await User.find<IUserDocument>(query)
      .populate("role")
      .select("-password");

    // Prepare flattened data
    const flattenedUsers = prepareUserExportData(users);

    // Convert to CSV
    const csv = await json2csv(flattenedUsers, {
      prependHeader: true,
      keys: [
        "_id",
        "username",
        "email",
        "isActive",
        "createdAt",
        "updatedAt",
        "roleName",
        "rolePermissions",
      ],
    });

    // Set response headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="users.csv"');

    // Send CSV
    res.send(csv);
  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const roleUserCounts = await User.aggregate([
      {
        $lookup: {
          from: "rolepermissions", // Collection name for RolePermissions
          localField: "role",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: "$roleDetails",
      },
      {
        $group: {
          _id: "$roleDetails.name",
          count: { $sum: 1 },
        },
      },
    ]);
    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleUserCounts,
    };
    res.status(200).json(stats);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const addNewRole = async (req: Request, res: Response) => {
  try {
    const { name, permissions }: IRolePermissions = req.body;
    if (!name || !permissions) {
      return res
        .status(400)
        .json({ message: "Role name and permissions are required" });
    }

    const newRole = await RolePermissions.create({ name, permissions });
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Role Creation Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Role ID is required" });
    }
    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }
    if (!permissions) {
      return res.status(400).json({ message: "Role permissions are required" });
    }
    const existingRole = await RolePermissions.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    if (name && existingRole.name === name) {
      return res.status(400).json({ message: "Role name already exists" });
    }
    if (permissions && permissions === existingRole.permissions) {
      return res
        .status(400)
        .json({ message: "Role permissions already exist" });
    }
    const updatedRole = await RolePermissions.findByIdAndUpdate(
      id,
      {
        name: name || existingRole.name,
        permissions: permissions || existingRole.permissions,
      },
      { new: true }
    );

    res.status(200).json(updatedRole);
  } catch (error) {
    console.error("Role Update Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await RolePermissions.find();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Role Update Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export { exportUsersToCsv, getStats, addNewRole, updateRole, getAllRoles };
