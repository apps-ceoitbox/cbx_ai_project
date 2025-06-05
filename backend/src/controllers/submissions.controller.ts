import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Submission, { SubmissionInterface } from "../models/submission.model";
import { asyncHandler } from "../utils/asyncHandler";
dotenv.config();

export default class SubmissionsController {
  static async getSubmissions(req, res) {
    try {
      const { page = 1, limit = 10, dateFrom, dateTo, tool, category, api, search, ...rest } = req.query;

      const query: any = { ...rest };

      // Date range filter
      if (dateFrom || dateTo) {
        query.createdAt = {
          ...(dateFrom ? { $gte: dateFrom } : {}),
          ...(dateTo ? { $lte: dateTo } : {}),
        };
      }

      // Optional regex filters
      if (tool && tool != "all") {
        query.tool = { $regex: tool, $options: "i" };
      }
      if (api && api != "all") {
        query.apiUsed = { $regex: api, $options: "i" };
      }
      if (category && category != "all") {
        query.category = { $regex: category, $options: "i" };
      }

      // Search across multiple fields (tool, api, category)
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { tool: { $regex: search, $options: "i" } },
          { apiUsed: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      console.log(query)

      const pageNumber = parseInt(page as string, 10) || 1;
      const limitNumber = parseInt(limit as string, 10) || 10;

      const submissions = await Submission.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const totalItems = await Submission.countDocuments(query);

      return res.status(200).json({
        message: "Submissions fetched successfully",
        data: submissions,
        totalPages: Math.ceil(totalItems / limitNumber),
        currentPage: pageNumber,
        totalItems,
      });
    } catch (err) {
      console.error("Error fetching submissions:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async getSubmissionFieldValues(req, res) {
    try {
      const fields = ['tool', 'category', 'apiUsed']; // Add more fields as needed

      const result: Record<string, string[]> = {};

      for (const field of fields) {
        result[field] = await Submission.distinct(field);
      }

      return res.status(200).json({
        message: 'Distinct values fetched successfully',
        data: result,
      });
    } catch (err) {
      console.error('Error fetching field values:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }


  static async getUserSubmission(req, res) {
    const submission = await Submission.find({ email: req.user.email }).sort({
      createdAt: -1,
    });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Submission fetched successfully", data: submission });
  }

  static async updateSubmission(req, res) {
    const id = req.params.id;
    const submission = await Submission.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Submission updated successfully", data: submission });
  }

  static async deleteSubmission(req, res) {
    const id = req.params.id;
    const submission = await Submission.findByIdAndDelete(id);
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Submission deleted successfully", data: submission });
  }
}
