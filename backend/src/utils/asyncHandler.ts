import { Request, Response, NextFunction } from "express";
import { logger } from "./logger"; // Assuming you have a logger set up

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(async (error) => {
      try {
        // Dynamically import stack-trace
        const stackTrace = (await import("stack-trace")).default;

        // Parse the error stack trace
        const trace = stackTrace.parse(error);
        const { fileName, lineNumber, columnNumber } = trace[0] || {};

        // Log the error details, including file name, line number, column number
        logger.error({
          message: error.message,
          stack: error.stack,
          fileName,
          lineNumber,
          columnNumber,
        });
      } catch (err) {
        // If parsing the stack trace fails, log the error directly
        logger.error({
          message: "Failed to capture stack trace",
          error: err,
        });
      }

      // Pass the error to the Express error handler
      next(error);
    });
  };
};
