import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import taskRoutes from "./task.routes";
import { authenticateToken } from "../middlewares/authMiddleware";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: Bearer  # Indicating it's a generic Bearer token (no JWT specifics)
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *       required:
 *         - name
 *         - email
 *         - password
 *     LoginRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *       required:
 *         - email
 *         - password
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 * 
 * security:
 *   - BearerAuth: []  # This applies the BearerAuth globally to all routes
 */

const router = Router();

// Routes that don't require authentication
router.use("/auth", authRoutes);  // Register and login routes

// Middleware that checks for a valid token (authentication)
router.use(authenticateToken);

// Routes that require authentication
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);

export default router;
