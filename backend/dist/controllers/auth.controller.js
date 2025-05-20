"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLicense = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorCodes_1 = require("../utils/errorCodes");
const admin_model_1 = __importDefault(require("../models/admin.model"));
const google_auth_library_1 = require("google-auth-library");
const aiSettings_controller_1 = __importDefault(require("./aiSettings.controller"));
dotenv_1.default.config();
const jwtSecret = process.env.JWT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.HOST_URL || `http://localhost:5173`;
const client = new google_auth_library_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const JWT_SECRET = process.env.JWT_SECRET;
const checkEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(email);
};
class AuthController {
}
_a = AuthController;
// Method to register a new user
AuthController.adminRegister = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, userName, password } = req.body;
    if (!email || !userName || !password) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Username, email and password fields are required' });
        return;
    }
    const existingUser = yield admin_model_1.default.findOne({ email }).lean();
    if (existingUser) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
        return;
    }
    // Hash password
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    // Create new user
    const newUser = new admin_model_1.default({ email, userName, password: hashedPassword });
    yield newUser.save();
    res.status(errorCodes_1.HttpStatusCodes.CREATED).json({ message: 'User registered successfully' });
}));
// Method to register a new user
AuthController.adminLogin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Email and password fields are required' });
        return;
    }
    // Check if the user exists
    const user = yield admin_model_1.default.findOne({ email }).lean();
    if (!user) {
        res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: 'User not found' });
        return;
    }
    // Compare the password
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid credentials' });
        return;
    }
    // Generate JWT
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET);
    delete user.password;
    yield aiSettings_controller_1.default.createAiEntries();
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Login successful', token, user });
}));
// Method to login a new user
AuthController.userLogin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, companyName = "", mobile = 0 } = req.body;
    if (!userName || !email) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ error: 'All fields are required' });
        return;
    }
    if (checkEmail(email)) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ error: 'Invalid email' });
        return;
    }
    const license = yield (0, exports.checkLicense)("AI_TEMPLATE_GENERATOR", email);
    if (!license) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({ error: 'Invalid license' });
        return;
    }
    // Check if the user exists
    const user = yield user_model_1.default.findOne({ email }).lean();
    if (!user) {
        let newUser = yield user_model_1.default.create({ userName, email, companyName, mobile });
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, JWT_SECRET);
        res.status(errorCodes_1.HttpStatusCodes.CREATED).json({ message: 'User registered successfully', data: newUser, token });
        return;
    }
    // Generate JWT
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET);
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Login successful', token, data: user });
}));
// Method to get all users
AuthController.initiateGoogleLogin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent", // This ensures that a new refresh token is issued
        scope: ["email", "profile"], // Add any additional scopes you need
    });
    res.redirect(authUrl);
}));
// Method to create a new user
AuthController.processGoogleLogin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    const { tokens } = yield client.getToken(code);
    // Use tokens.access_token for accessing Google APIs on behalf of the user
    const { email } = yield client.getTokenInfo(tokens.access_token);
    const ticket = yield client.verifyIdToken({
        idToken: tokens.id_token,
        audience: CLIENT_ID, // Specify your app's client ID
    });
    const payload = ticket.getPayload();
    const userEmail = payload.email;
    const userName = payload.name;
    const photo = payload.picture;
    const existingUser = yield user_model_1.default.findOne({ email }).lean();
    if (existingUser) {
        let updatedUser = yield user_model_1.default.findOneAndUpdate({ email }, {
            googleRefreshToken: tokens.refresh_token,
            photo,
        }, { new: true });
        const token = jsonwebtoken_1.default.sign({ userId: existingUser._id }, jwtSecret);
        delete existingUser.googleRefreshToken;
        res.send({
            data: updatedUser,
            token,
        });
        return;
    }
    else {
        let newUser = yield user_model_1.default.create({
            email: userEmail,
            userName,
            password: userEmail,
            googleRefreshToken: tokens.refresh_token,
            photo,
        });
        newUser = JSON.parse(JSON.stringify(newUser));
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, jwtSecret);
        delete newUser.googleRefreshToken;
        res.send({
            data: newUser,
            token,
        });
        return;
    }
}));
exports.default = AuthController;
const axios_1 = __importDefault(require("axios"));
const checkLicense = (appName, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://auth.ceoitbox.com/checkauth/${appName}/${email}/${appName}/NA/NA`;
        const response = yield axios_1.default.get(url);
        const data = response.data;
        return data.valid === "Active";
    }
    catch (error) {
        console.error("Error verifying license:", error.message);
        return false;
    }
});
exports.checkLicense = checkLicense;
