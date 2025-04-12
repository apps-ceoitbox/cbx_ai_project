import express, { Application } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler";
import path from "path";


dotenv.config();

const app: Application = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
// Routes
app.use("/api", routes);
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
});
// Error handling middleware
app.use(errorHandler);

export default app;


