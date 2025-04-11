import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

/**
 * @swagger
 * /api/users/getUser:
 *   get:
 *     summary: Get user data using a token
 *     description: Retrieve user data by passing an authorization token in the request header.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Server error.
 */
router.get("/getUser", UserController.getUserDataWithToken);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a specific user by providing their ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.delete("/:id", UserController.deleteUser);

export default router;
