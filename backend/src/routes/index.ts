import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import { authenticateToken } from "../middlewares/authMiddleware";
import aiSettingsRoutes from "./aiSettings.routes";
import promptRoutes from "./prompt.routes";
import submissionRoutes from "./submission.routes";
const router = Router();

// Routes that don't require authentication
router.use("/auth", authRoutes);  // Register and login routes

// Middleware that checks for a valid token (authentication)
router.use(authenticateToken);

// Routes that require authentication
router.use("/users", userRoutes);
router.use("/aiSettings", aiSettingsRoutes);
router.use("/prompt", promptRoutes);
router.use("/submission", submissionRoutes);

export default router;
