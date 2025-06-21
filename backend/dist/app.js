"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./utils/errorHandler");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = ["http://localhost:5173", "https://ai.ceoitbox.com"];
// Middleware
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json({ limit: "50mb" }));
// app.use(cors());
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend/dist")));
// Routes
app.use("/api", routes_1.default);
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../frontend", "dist", "index.html"));
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
