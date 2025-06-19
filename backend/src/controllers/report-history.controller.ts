import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ReportHistory from "../models/report-history.model";
import { HttpStatusCodes } from "../utils/errorCodes";
import { asyncHandler } from "../utils/asyncHandler";

export default class ReportHistoryController {
  // Admin: Get all Report history across all users
  static getAllReportHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const history = await ReportHistory.find({}).sort({ createdAt: -1 });
        // .select("name email fileName fileType createdAt");

        res.status(HttpStatusCodes.OK).json({
          message: "All Report history fetched successfully",
          data: history,
        });
      } catch (error) {
        console.error("Error fetching all Report history:", error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to fetch Report history",
        });
      }
    }
  );

  // Report: Get all history for a user
  static getReportHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?.email;
      const history = await ReportHistory.find({
        email: userId,
      }).sort({ createdAt: -1 });
      // .select("fileName fileType createdAt");

      res.status(HttpStatusCodes.OK).json({
        message: "Report history fetched successfully",
        data: history,
      });
    }
  );

  // Report: Get a specific history item
  static getReportHistoryItem = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id;
      const historyId = req.params.id;

      if (!userId) {
        console.error("User ID missing from req.user for getReportHistoryItem");
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(historyId)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid history ID format" });
        return;
      }

      const historyItem = await ReportHistory.findOne({
        _id: historyId,
        userId: userId,
      });

      if (!historyItem) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "History item not found",
        });
        return;
      }

      res.status(HttpStatusCodes.OK).json({
        message: "History item fetched successfully",
        data: historyItem,
      });
    }
  );

  // Report: Save history
  static saveReportHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id;
      const { fileName, fileType, report } = req.body;

      if (!userId) {
        console.error("User ID missing from req.user for saveReportHistory");
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return;
      }

      if (!fileName || !fileType || !report) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Missing required fields",
        });
        return;
      }

      const newHistoryItem = new ReportHistory({
        userId,
        name: req.user?.userName || "User",
        email: req.user?.email || "user@example.com",
        fileName,
        fileType,
        report,
      });

      await newHistoryItem.save();

      res.status(HttpStatusCodes.CREATED).json({
        message: "Report history saved successfully",
        data: newHistoryItem,
      });
    }
  );

  // Report: Delete history item
  static deleteReportHistoryItem = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const { id } = req.params;

      const result = await ReportHistory.findOneAndDelete({
        _id: id,
      });

      // if (result.deletedCount === 0) {
      //   res.status(HttpStatusCodes.NOT_FOUND).json({
      //     message: "History item not found or already deleted",
      //   });
      //   return;
      // }

      res.status(HttpStatusCodes.OK).json({
        message: "History item deleted successfully",
      });
    }
  );

  // Report: Clear all history for a user
  static clearReportHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id;

      if (!userId) {
        console.error("User ID missing from req.user for clearReportHistory");
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return;
      }

      const result = await ReportHistory.deleteMany({
        userId: userId,
      });

      res.status(HttpStatusCodes.OK).json({
        message: "All Report history cleared successfully",
        deletedCount: result.deletedCount,
      });
    }
  );
}
