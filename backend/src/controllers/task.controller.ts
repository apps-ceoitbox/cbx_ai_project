import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import dotenv from "dotenv";
import Task from "../models/task.model";
import { HttpStatusCodes } from "../utils/errorCodes";

dotenv.config();

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            _id: string;
            // Add other properties as needed
        };
    }
}

export default class TaskController {

    // Method to get all Tasks of a user
    static getAllTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const tasks = await Task.find({ ...req.query, createdBy: req.user._id }).lean();
        res.status(HttpStatusCodes.OK).json({ message: "Tasks Fetched Successfully", data: tasks });
    })

    // Method to get a Task
    static getTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.params.id) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Task id is required' });
            return
        }
        const tasks = await Task.findOne({ ...req.query, _id: req.params.id, createdBy: req.user._id }).lean();
        if (!tasks) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'Task not found' });
            return;
        }
        res.status(HttpStatusCodes.OK).json({ message: 'Task Fetched Successfully', data: tasks });
    })

    // Method to Add new Task
    static addNewTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const user = req.user;
        const { title, description="", status } = req.body;
        if (!title || !status) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Title, description and status fields are required' });
            return
        }
        if (!["pending", "inProgress", "completed"].includes(status)) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid status' });
            return
        }
        const newData = { title, description, status, createdBy: user._id };
        const newTask = await Task.create(newData);
        res.status(HttpStatusCodes.CREATED).json({ message: 'Task Created Successfully', data: newTask });
    })

    //Method to update Task
    static updateTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!id) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Task id is required' });
            return
        }
        const { title, description, status } = req.body;

        const task = await Task.findOne({ _id: id, createdBy: req.user._id });
        if (!task) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'Task not found' });
            return;
        }

        if (!["pending", "inProgress", "completed"].includes(status)) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid status' });
            return
        }
        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.status = status ?? task.status;

        await task.save();
        res.status(HttpStatusCodes.OK).json({ message: 'Task Updated Successfully', data: task });
    })

    // Method to delete a task
    static deleteTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!id) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Task id is required' });
            return
        }
        const deletedTask = await Task.findOneAndDelete({ _id: id, createdBy: req.user._id }).lean();

        if (!deletedTask) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'Task not found' });
            return;
        }

        res.status(HttpStatusCodes.OK).json({ message: 'Task Deleted Successfully', data: deletedTask });
    })

    // Method to delete multiple Tasks
    static bulkDelete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { ids } = req.body; // Expecting an array of _ids in the body

        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Ids must be a non-empty array');
        }

        try {
            const result = await Task.deleteMany({ _id: { $in: ids }, createdBy: req.user._id });

            if (result.deletedCount === 0) {
                throw new Error('No tasks deleted');
            }

            res.status(HttpStatusCodes.OK).send({ message: 'Tasks deleted successfully', result });
        } catch (error) {
            res.status(HttpStatusCodes.OK).send({ error: 'Something Went Wrong !' });
        }
    });

}