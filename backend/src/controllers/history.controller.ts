import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ZoomaryHistory from "../models/zoomary-history.model";
import CompanyProfileHistory from "../models/company-profile-history.model";
import MailSenderHistory from "../models/mail-sender-history.model";
import { HttpStatusCodes } from "../utils/errorCodes";
import { asyncHandler } from "../utils/asyncHandler";

dotenv.config();

export default class HistoryController {
  // Admin: Get all Mail Sender history across all users
  static getAllMailSenderHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const history = await MailSenderHistory.find({})
          .sort({ createdAt: -1 })
          .select("recipient subject message response name email createdAt");

        res.status(HttpStatusCodes.OK).json({
          message: "All Mail Sender history fetched successfully",
          data: history,
        });
      } catch (error) {
        console.error("Error fetching all Mail Sender history:", error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to fetch Mail Sender history",
        });
      }
    }
  );

  // Admin: Get all Zoomary history across all users
  static getAllZoomaryHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const history = await ZoomaryHistory.find({})
          .sort({ createdAt: -1 })
          .select("name email title summary meetingDate createdAt");

        res.status(HttpStatusCodes.OK).json({
          message: "All Zoomary history fetched successfully",
          data: history,
        });
      } catch (error) {
        console.error("Error fetching all Zoomary history:", error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to fetch Zoomary history",
        });
      }
    }
  );

  // Mail Sender: Get all history
  static getMailSenderHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id;

      if (!userId) {
        console.error("User ID missing from req.user for getMailSenderHistory");
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format for query" });
        return; // Ensure void return
      }

      const history = await MailSenderHistory.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ createdAt: -1 })
        .select("recipient subject createdAt");

      res.status(HttpStatusCodes.OK).json({
        message: "Mail sender history fetched successfully",
        data: history,
      });
    }
  );

  // Mail Sender: Save history
  static saveMailSenderHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      console.log(
        "saveMailSenderHistory: req.user received:",
        JSON.stringify(req.user, null, 2)
      ); // Log req.user
      const { recipient, subject, message, response } = req.body;
      const userEmail = req.user?.email;
      const userName = req.user?.userName;
      const userId = req.user?._id;

      if (!userEmail || !userName || !userId) {
        console.error(
          "User details missing from req.user for saveMailSenderHistory - Email, Name, or ID is missing."
        );
        console.error(
          "User details missing from req.user for saveMailSenderHistory"
        );
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user details missing",
        });
        return; // Ensure void return
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format for saving" });
        return; // Ensure void return
      }

      if (!recipient || !subject || !message || !response) {
        console.error("Required fields missing from request body.");
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Recipient, subject, message, and response are required",
        });
        return; // Ensure void return
      }

      const newHistoryData = {
        // Prepare data for logging and model
        name: userName,
        email: userEmail,
        userId: new mongoose.Types.ObjectId(userId),
        recipient,
        subject,
        message,
        response,
      };

      console.log(
        "saveMailSenderHistory: Data prepared for saving:",
        JSON.stringify(newHistoryData, null, 2)
      ); // Log data before saving

      const newHistory = new MailSenderHistory(newHistoryData);

      await newHistory.save();

      res.status(HttpStatusCodes.CREATED).json({
        message: "Mail sender history saved successfully",
        data: newHistory,
      });
    }
  );

  // Mail Sender: Delete history item
  static deleteMailSenderHistoryItem = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        console.error(
          "User ID missing from req.user for deleteMailSenderHistoryItem"
        );
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
      }

      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid history item ID or user ID format" });
        return; // Ensure void return
      }

      try {
        const result = await MailSenderHistory.findOneAndDelete({
          _id: id,
          userId: new mongoose.Types.ObjectId(userId),
        });

        if (!result) {
          res.status(HttpStatusCodes.NOT_FOUND).json({
            message:
              "History item not found, not authorized, or already deleted",
          });
          return; // Ensure void return
        }

        res.status(HttpStatusCodes.OK).json({
          message: "Mail sender history item deleted successfully",
          data: { id: result._id }, // Return the ID of the deleted item
        });
      } catch (error) {
        console.error("Error deleting Mail sender history item:", error);
        // Pass to the generic error handler or handle specifically
        next(error);
      }
    }
  );

  // Mail Sender: Clear all history
  static clearMailSenderHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id;

      if (!userId) {
        console.error(
          "User ID missing from req.user for clearMailSenderHistory"
        );
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format" });
        return; // Ensure void return
      }

      try {
        const result = await MailSenderHistory.deleteMany({
          userId: new mongoose.Types.ObjectId(userId),
        });

        res.status(HttpStatusCodes.OK).json({
          message: "Mail sender history cleared successfully",
          data: { deletedCount: result.deletedCount },
        });
      } catch (error) {
        console.error("Error clearing Mail sender history:", error);
        // Pass to the generic error handler or handle specifically
        next(error);
      }
    }
  );

  // Zoomary: Get all history
  static getZoomaryHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or email missing",
          data: [],
        });
        return; // Ensure void return for asyncHandler
      }

      const history = await ZoomaryHistory.find({ email: userEmail })
        .sort({ createdAt: -1 })
        .select("title summary meetingDate createdAt");

      res.status(HttpStatusCodes.OK).json({
        message: "Zoomary history fetched successfully",
        data: history,
      });
    }
  );

  // Zoomary: Save history
  static saveZoomaryHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const { title, summary, meetingDate } = req.body;
      const userEmail = req.user?.email;
      const userName = req.user?.userName;

      if (!userEmail || !userName) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user details missing",
        });
        return; // Ensure void return
      }

      if (!title || !summary) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Title and summary are required" });
        return; // Ensure void return
      }
      const newHistory = new ZoomaryHistory({
        name: userName,
        email: userEmail,
        title,
        summary,
        meetingDate: meetingDate || new Date(),
      });

      await newHistory.save();

      res.status(HttpStatusCodes.CREATED).json({
        message: "Zoomary history saved successfully",
        data: newHistory,
      });
    }
  );

  // Zoomary: Delete history item
  static deleteZoomaryHistoryItem = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid history item ID" });
        return; // Ensure void return
      }

      try {
        const result = await ZoomaryHistory.findOneAndDelete({
          _id: id,
        });

        if (!result) {
          res.status(HttpStatusCodes.NOT_FOUND).json({
            message:
              "History item not found, not authorized, or already deleted",
          });
          return; // Ensure void return
        }

        res.status(HttpStatusCodes.OK).json({
          message: "Zoomary history item deleted successfully",
          data: { id: result._id },
        });
      } catch (error) {
        console.error("Error deleting Zoomary history item:", error);
        next(error);
      }
    }
  );

  // Zoomary: Clear all history
  static clearZoomaryHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userEmail = req.user?.email;

      if (!userEmail) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or email missing",
        });
        return; // Ensure void return
      }

      try {
        const result = await ZoomaryHistory.deleteMany({ email: userEmail });

        res.status(HttpStatusCodes.OK).json({
          message: "Zoomary history cleared successfully",
          data: { deletedCount: result.deletedCount },
        });
      } catch (error) {
        console.error("Error clearing Zoomary history:", error);
        next(error);
      }
    }
  );

  // CompanyProfile: Get all history
  static getCompanyProfileHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id; // Changed from req.user?.id to req.user?._id

      if (!userId) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format for query" });
        return; // Ensure void return
      }

      const history = await CompanyProfileHistory.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ createdAt: -1 })
        .select("companyName sourcedFrom createdAt");

      res.status(HttpStatusCodes.OK).json({
        message: "Company profile history fetched successfully",
        data: history,
      });
    }
  );

  // CompanyProfile: Get single history item
  static getCompanyProfileHistoryItem = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id; // Changed from req.user?.id to req.user?._id
      const { id } = req.params;

      if (!userId) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
      }

      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid history item ID or user ID format" });
        return; // Ensure void return
      }

      const historyItem = await CompanyProfileHistory.findOne({
        _id: id,
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!historyItem) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ message: "History item not found or not authorized" });
        return; // Ensure void return
      }

      res.status(HttpStatusCodes.OK).json({
        message: "Company profile history item fetched successfully",
        data: historyItem,
      });
    }
  );

  // CompanyProfile: Save history
  static saveCompanyProfileHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const { companyName, report, sourcedFrom } = req.body;
      const userEmail = req.user?.email;
      const userName = req.user?.userName;
      const userId = req.user?._id; // Changed from req.user?.id to req.user?._id

      if (!userEmail || !userName || !userId) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user details missing",
        });
        return; // Ensure void return
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format for saving" });
        return; // Ensure void return
      }

      if (!companyName || !report) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Company name and report are required" });
        return; // Ensure void return
      }

      const newHistoryData = {
        // Prepare data for logging and model
        name: userName,
        email: userEmail,
        userId: new mongoose.Types.ObjectId(userId),
        companyName,
        report,
        sourcedFrom: sourcedFrom || "Gmail",
      };

      const newHistory = new CompanyProfileHistory(newHistoryData);

      await newHistory.save();

      res.status(HttpStatusCodes.CREATED).json({
        message: "Company profile history saved successfully",
        data: newHistory,
      });
    }
  );

  // CompanyProfile: Delete history item
  static deleteCompanyProfileHistoryItem = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid history item ID or user ID format" });
        return; // Ensure void return
      }

      try {
        const result = await CompanyProfileHistory.findOneAndDelete({
          _id: id,
        });

        if (!result) {
          res.status(HttpStatusCodes.NOT_FOUND).json({
            message:
              "History item not found, not authorized, or already deleted",
          });
          return; // Ensure void return
        }

        res.status(HttpStatusCodes.OK).json({
          message: "Company profile history item deleted successfully",
          data: { id: result._id },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // CompanyProfile: Clear all history
  static clearCompanyProfileHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      const userId = req.user?._id;

      if (!userId) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format" });
        return; // Ensure void return
      }

      try {
        const result = await CompanyProfileHistory.deleteMany({
          userId: new mongoose.Types.ObjectId(userId),
        });

        res.status(HttpStatusCodes.OK).json({
          message: "Company profile history cleared successfully",
          data: { deletedCount: result.deletedCount },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // This function will be added to the HistoryController class
  static getAllCompanyProfileHistory = asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const history = await CompanyProfileHistory.find({})
          .sort({ createdAt: -1 })
          .select("name email companyName report sourcedFrom createdAt");

        res.status(HttpStatusCodes.OK).json({
          message: "All Company Profile history fetched successfully",
          data: history,
        });
      } catch (error) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to fetch Company Profile history",
        });
      }
    }
  );
}
