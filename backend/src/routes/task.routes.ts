import { Router } from "express";
import TaskController from "../controllers/task.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the task.
 *         description:
 *           type: string
 *           description: Detailed description of the task.
 *         status:
 *           type: pending | inProgress | completed
 *           description: Indicates whether the task is completed.
 *       required:
 *         - title
 *         - status
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a list of all tasks.
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: A list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error.
 */
router.get("/", TaskController.getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Retrieve a single task by its ID.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Server error.
 */
router.get("/:id", TaskController.getTask);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Add a new task to the list.
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Server error.
 */
router.post("/", TaskController.addNewTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task by ID
 *     description: Update the details of a specific task.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Server error.
 */
router.patch("/:id", TaskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     description: Remove a specific task from the list.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Server error.
 */
router.delete("/:id", TaskController.deleteTask);

/**
 * @swagger
 * /api/tasks/bulkDelete:
 *   post:
 *     summary: Bulk delete tasks
 *     description: Delete multiple tasks by their IDs.
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of task IDs to delete.
 *     responses:
 *       200:
 *         description: Tasks deleted successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Server error.
 */
router.post("/bulkDelete", TaskController.bulkDelete);

export default router;
