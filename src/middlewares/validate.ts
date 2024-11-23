import { Request, Response, NextFunction } from "express";
import { z, AnyZodObject } from "zod";

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // If it's a ZodError
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: 'Invalid request' });
    }
  };

  export default validate
