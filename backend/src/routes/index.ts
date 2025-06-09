import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import viewRoutes from "./view.routes";
import { authenticateToken } from "../middlewares/authMiddleware";
import aiSettingsRoutes from "./aiSettings.routes";
import promptRoutes from "./prompt.routes";
import submissionRoutes from "./submission.routes";
import astroRoutes from "./astro.routes";
import documentRoutes from "./document.routes";
import historyRoutes from "./history.routes";
import aiAgentRoutes from "./aiAgentSettings.routes";

const router = Router();

// Routes that don't require authentication
router.use("/auth", authRoutes); // Register and login routes
router.use("/view", viewRoutes);
// Middleware that checks for a valid token (authentication)
router.use(authenticateToken);

// Routes that require authentication

router.use("/users", userRoutes);
router.use("/aiSettings", aiSettingsRoutes);
router.use("/prompt", promptRoutes);
router.use("/submission", submissionRoutes);
router.use("/astro", astroRoutes);
router.use("/document", documentRoutes);
router.use("/history", historyRoutes);
router.use("/aiagentsettings", aiAgentRoutes);

export default router;
