import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { json2csv } from "json-2-csv";
import * as ExcelJS from "exceljs";
import {
  ExportQuery,
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
    const { isActive, role, startDate, endDate }: ExportQuery = req.query;
    if (startDate && isNaN(Date.parse(startDate as string))) {
      return res.status(400).json({
        message: "Invalid start date format",
      });
    }

    if (endDate && isNaN(Date.parse(endDate as string))) {
      return res.status(400).json({
        message: "Invalid end date format",
      });
    }

    // Construct dynamic query
    const query: any = {};
    if (isActive) query.isActive = isActive === "true";
    if (role) query["role.name"] = role;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Fetch users with optional filtering
    const users = await User.find<IUserDocument>(query)
      .populate("role", "_id name permissions isActive")
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
    // Enhanced error logging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown export error";

    console.error("Users Export Error:", {
      timestamp: new Date().toISOString(),
      error: errorMessage,
      query: req.query,
    });

    res.status(500).json({
      message: "Failed to export users",
      error: errorMessage,
    });
  }
};
const exportUsersToExcel = async (req: Request, res: Response) => {
  try {
    // Optional query parameters for filtering
    const { isActive, role, startDate, endDate }: ExportQuery = req.query;

    if (startDate && isNaN(Date.parse(startDate as string))) {
      return res.status(400).json({
        message: "Invalid start date format",
      });
    }

    if (endDate && isNaN(Date.parse(endDate as string))) {
      return res.status(400).json({
        message: "Invalid end date format",
      });
    }

    // Construct dynamic query
    const query: any = {};
    if (isActive) query.isActive = isActive === "true";
    if (role) query["role.name"] = role;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Fetch users with optional filtering
    const users = await User.find<IUserDocument>(query)
      .populate("role", "_id name permissions isActive")
      .select("-password");

    // Prepare flattened data
    const flattenedUsers = prepareUserExportData(users);

    // Manually define headers if extractUniqueFields is unreliable
    const defaultHeaders = [
      "_id",
      "username",
      "email",
      "isActive",
      "createdAt",
      "updatedAt",
      "roleName",
      "rolePermissions",
    ];

    // Use default headers or fall back to Object.keys if flattenedUsers exists
    const headers =
      flattenedUsers.length > 0
        ? Object.keys(flattenedUsers[0])
        : defaultHeaders;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users", {
      properties: {
        tabColor: { argb: "FF00FF00" },
      },
    });

    // Style headers
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 20, // Set column width
    }));

    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFF" },
      size: 12,
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4467B4" },
    };

    // Add data rows with formatting
    worksheet.addRows(flattenedUsers);

    // Optional: Add auto filters
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    // Stream response for large files
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="users.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    // Enhanced error logging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown export error";

    console.error("Users Export Error:", {
      timestamp: new Date().toISOString(),
      error: errorMessage,
      query: req.query,
    });

    res.status(500).json({
      message: "Failed to export users",
      error: errorMessage,
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
    const totalRoles = await RolePermissions.countDocuments();
    const activeRoles = await RolePermissions.countDocuments({
      isActive: true,
    });
    

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleUserCounts,
      totalRoles,
      activeRoles,
   
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
    const existingRole = await RolePermissions.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: "Role name already exists" });
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
    const existingRole = await RolePermissions.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    // if (name && existingRole.name === name) {
    //   return res.status(400).json({ message: "Role name already exists" });
    // }
    // if (permissions && permissions === existingRole.permissions) {
    //   return res
    //     .status(400)
    //     .json({ message: "Role permissions already exist" });
    // }
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
export {
  exportUsersToCsv,
  getStats,
  addNewRole,
  updateRole,
  getAllRoles,
  exportUsersToExcel,
};
