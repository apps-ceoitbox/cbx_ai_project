import { Request, Response } from "express";
import User, { UserInterface } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Admin from "../models/admin.model";
import AiSettingsController from "./aiSettings.controller";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

const checkEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(email);
}

export default class AuthController {

    // Method to register a new user
    static adminRegister = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, userName, password } = req.body;

        if (!email || !userName || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Username, email and password fields are required' });
            return
        }

        const existingUser = await Admin.findOne({ email }).lean();

        if (existingUser) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10,);

        // Create new user
        const newUser = new Admin({ email, userName, password: hashedPassword });
        await newUser.save();

        res.status(HttpStatusCodes.CREATED).json({ message: 'User registered successfully' });
    })

    // Method to register a new user
    static adminLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Email and password fields are required' });
            return
        }

        // Check if the user exists
        const user = await Admin.findOne({ email }).lean();
        if (!user) {
            res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid credentials' });
            return
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET );
        delete user.password;

        await AiSettingsController.createAiEntries();

        res.status(HttpStatusCodes.OK).json({ message: 'Login successful', token, user });
    })

    // Method to login a new user
    static userLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { userName, email, companyName, mobile } = req.body as UserInterface;

        if (!userName || !email || !companyName || !mobile) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'All fields are required' });
            return
        }
        if (checkEmail(email)) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'Invalid email' });
            return
        }

        const license = await checkLicense("AI_TEMLATE_GENERATOR", email);

        if (!license) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'Invalid license' });
            return
        }

        // Check if the user exists
        const user = await User.findOne({ email }).lean();

        if (!user) {
            let newUser = await User.create({ userName, email, companyName, mobile });

            const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
                expiresIn: '1h',
            });

            res.status(HttpStatusCodes.CREATED).json({ message: 'User registered successfully', data: newUser, token });
            return
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(HttpStatusCodes.OK).json({ message: 'Login successful', token, data: user });
    })

}

import axios from "axios";

export const checkLicense = async (appName: string, email: string) => {
  try {
    const url = `https://auth.ceoitbox.com/checkauth/${appName}/${email}/${appName}/NA/NA`;

    const response = await axios.get(url);
    const data = response.data;

    return data.valid === "Active";
  } catch (error) {
    console.error("Error verifying license:", error.message);
    return false;
  }
};
