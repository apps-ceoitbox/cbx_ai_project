import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Submission, { SubmissionInterface } from "../models/submission.model";
import { asyncHandler } from "../utils/asyncHandler";
dotenv.config();

export default class SubmissionsController {

    static async getSubmissions(req, res) {
        const submissions = await Submission.find().sort({ createdAt: -1 });
        res.status(HttpStatusCodes.OK).json({ message: 'Submissions fetched successfully', data: submissions });
    }

    static async getUserSubmission(req, res) {
        const submission = await Submission.find({ email: req.user.email }).sort({ createdAt: -1 });
        res.status(HttpStatusCodes.OK).json({ message: 'Submission fetched successfully', data: submission });
    }

    static async updateSubmission(req, res) {
        const id = req.params.id;
        const submission = await Submission.findByIdAndUpdate(id, req.body, { new: true });
        res.status(HttpStatusCodes.OK).json({ message: 'Submission updated successfully', data: submission });
    }

    static async deleteSubmission(req, res) {
        const id = req.params.id;
        const submission = await Submission.findByIdAndDelete(id);
        res.status(HttpStatusCodes.OK).json({ message: 'Submission deleted successfully', data: submission });
    }

}