import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded; // Attach decoded token to the request object

    next(); // Proceed to the next middleware
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          error: error.name,
          message: "Unauthorized: Token has expired",
        });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token verification failed" });
    }
  }
};
