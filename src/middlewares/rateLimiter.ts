import { Request, Response, NextFunction } from "express";
import expressRateLimit from "express-rate-limit";

const rateLimiter = expressRateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    msg: "Too many login attempts, please try again after 60 seconds",
  },
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    // log for backend
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
export default rateLimiter;
