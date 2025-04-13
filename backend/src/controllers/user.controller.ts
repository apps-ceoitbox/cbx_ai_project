import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import User from "../models/user.model";
import Task from "../models/ai.model";
import { MAIL } from "../utils/sendMail";

export default class UserController {

  // Method to get user data with jwt token
  static getUserDataWithToken = asyncHandler(async (req, res) => {
    res.status(HttpStatusCodes.OK).send(req.user);
  })

  static sendEmail = asyncHandler(async (req, res) => {
    const { to, subject, body } = req.body;
    MAIL({
      to, subject, body
    })
    res.json({
      status: true,
      message: "Email sent Successfully"
    })
  })

  // Method to delete user
  static deleteUser = asyncHandler(async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      await Task.deleteMany({ createdBy: req.user._id });
      res.status(HttpStatusCodes.OK).send({ message: "User and its all Tasks Deleted Successfully" });
    }
    catch (err) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err)
    }
  })

}
