import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Submission, { SubmissionInterface } from "../models/submission.model";
import ZoomaryHistory from "../models/zoomary-history.model";
import CompanyProfileHistory from "../models/company-profile-history.model";

dotenv.config();

export default class ViewController {
  static async getUserSubmissionById(req, res) {
    const submission = await Submission.findOne({ _id: req.params.id });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Submission fetched successfully", data: submission });
  }
  static async getZoomAgentSubmissionById(req, res) {
    const submission = await ZoomaryHistory.findOne({ _id: req.params.id });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Submission fetched successfully", data: submission });
  }
  static async getCompanyProfileAgentSubmissionById(req, res) {
    const submission = await CompanyProfileHistory.findOne({
      _id: req.params.id,
    });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Submission fetched successfully", data: submission });
  }
}
