import { User } from "../models/user.schema";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { IUser, jwtPayload } from "../utils/types";
import jwt from "jsonwebtoken";

const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }
    const user = await User.findOne<IUser>({ email }).populate("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "User is inactive" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload: jwtPayload = {
      email: user.email,
      role: user.role,
    };
    const secret = process.env.JWT_SECRET!;
    const accessToken = jwt.sign(payload, secret, { expiresIn: "1d" });
    const refreshToken = jwt.sign(payload, secret, { expiresIn: "7d" });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!);
    const user = await User.findOne<IUser>({
      email: (payload as jwtPayload).email,
    });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: "User is inactive" });
    }
    const newAccessToken = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );
    return res.status(200).json({ newAccessToken });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { signin, refresh };
