import { Request, Response, NextFunction } from "express";

export const asyncHandler = (
  fn: (req: Request & { user?: any }, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(async (error) => {
      console.log(error)
      // Pass the error to the Express error handler
      next(error);
    });
  };
};
