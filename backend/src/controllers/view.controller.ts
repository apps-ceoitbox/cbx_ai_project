import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Submission, { SubmissionInterface } from "../models/submission.model";

dotenv.config();

export default class ViewController {
  static async getUserSubmissionById(req, res) {
    const submission = await Submission.findOne({ _id: req.params.id });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Submission fetched successfully", data: submission });
  }
}
