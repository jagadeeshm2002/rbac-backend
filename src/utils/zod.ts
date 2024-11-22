import { query } from "express";
import { z } from "zod";

export const signinSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }).min(6),
  }),
});
const role = z.enum(["admin", "user", "guest", "manager", "developer"]);

export const userAddSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(3)
      .max(20),
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }).min(6),
    role: role,
    isActive: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
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

export type ISignin = z.infer<typeof signinSchema>;
export type IUserAdd = z.infer<typeof userAddSchema>;

export type IUpdateUser = z.infer<typeof updateUserSchema>;
