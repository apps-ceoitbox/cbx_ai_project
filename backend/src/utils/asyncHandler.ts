import { Request, Response, NextFunction } from "express";
import { logger } from "./logger"; // Assuming you have a logger set up

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(async (error) => {
      console.log(error)
      // Pass the error to the Express error handler
      next(error);
    });
  };
};
