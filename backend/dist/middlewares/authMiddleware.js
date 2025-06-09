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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const SECRET_KEY = process.env.JWT_SECRET;
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access token is missing or invalid" });
        return; // Ensure no further code execution
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = yield user_model_1.default.findById(decoded.userId, { password: 0, googleRefreshToken: 0, isApproved: 0 }).lean();
        if (!user) {
            const admin = yield admin_model_1.default.findOne({ _id: decoded.userId });
            if (!admin) {
                res.status(403).json({ message: "User not found" });
                return;
            }
            req.user = admin;
            next();
            return;
        }
        req.user = Object.assign(Object.assign({}, user), { access: decoded.access || "user" }); // Attach decoded token to request
        next(); // Proceed to the next middleware or route
    }
    catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
});
exports.authenticateToken = authenticateToken;
