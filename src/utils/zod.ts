import exp from "constants";
import { start } from "repl";
import { string, z } from "zod";

// /api/auth signin validation
export const zsigninSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      username: z.string().optional(),
      password: z.string().min(6),
    })
    .refine((data) => data.email || data.username, {
      message: "Either email or username must be provided",
    }),
});
const role = z.enum(["admin", "user", "guest", "manager", "developer"]);

// /api/users create new user validation
export const zuserAddSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(3)
      .max(20),
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }).min(6),
    role: role.optional().default("user"),
    isActive: z.boolean().optional(),
  }),
});
// /api/users update user validation
export const zupdateUserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(3)
      .max(20)
      .optional(),
    email: z.string({ required_error: "Email is required" }).email().optional(),
    password: z
      .string({ required_error: "Password is required" })
      .min(6)
      .optional(),
    role: role.optional(),
    isActive: z.boolean().optional().optional(),
  }),
});
// /api/users/:id delete user validation
export const zdeleteUser = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// api/users/:id getuser by id validation
export const zgetUserById = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// api/users get all users validation
export const zgetAllUsers = z.object({
  query: z.object({
    role: role.optional(),
    isActive: z.boolean().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

//admin routes

// /api/admin/getusercsv
export const zexportUsersToCsv = z.object({
  body: z.object({
    role: role.optional(),
    isActive: z.boolean().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
// /api/admin/stats
export const zgetStats = z.object({});

// /api/roles get all roles validation
export const zgetAllRoles = z.object({});

// /api/role add new role validation
export const zaddNewRole = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(3).max(20),
    permissions: z.array(z.string()).min(1),
  }),
});
// /api/role update role validation
export const zupdateRole = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: "Name is required" })
        .min(3)
        .max(20)
        .optional(),
      permissions: z.array(z.string()).min(1).optional(),
      isActive: z.boolean().optional(),
     
    })
    .refine((data) => data.name || data.permissions, {
      message: "Either name or permissions must be provided",
    }),
});

export type ISignin = z.infer<typeof zsigninSchema>;
export type IUserAdd = z.infer<typeof zuserAddSchema>;
export type IdeleteUser = z.infer<typeof zdeleteUser>;
export type IUpdateUser = z.infer<typeof zupdateUserSchema>;
export type IGetUserById = z.infer<typeof zgetUserById>;
export type IGetAllUsers = z.infer<typeof zgetAllUsers>;
export type IExportUsersToCsv = z.infer<typeof zexportUsersToCsv>;
export type IGetStats = z.infer<typeof zgetStats>;
export type IGetAllRoles = z.infer<typeof zgetAllRoles>;
export type IAddNewRole = z.infer<typeof zaddNewRole>;
export type IUpdateRole = z.infer<typeof zupdateRole>;
