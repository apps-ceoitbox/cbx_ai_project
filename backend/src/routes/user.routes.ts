import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

router.get("/getUser", UserController.getUserDataWithToken);
router.post("/email", UserController.sendEmail);
router.post("/profile", UserController.updateProfile);
router.delete("/:id", UserController.deleteUser);

export default router;
