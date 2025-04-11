import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import User from "../models/user.model";
import Task from "../models/task.model";

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      _id: string;
      // Add other properties as needed
    };
  }
}

export default class UserController {
  
  // Method to get user data with jwt token
  static getUserDataWithToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.status(HttpStatusCodes.OK).send(req.user);
  })

  // Method to delete user
  static deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
