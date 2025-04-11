import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/admin/register", AuthController.adminRegister);
router.post("/admin/login", AuthController.adminLogin);

router.post("/user/login", AuthController.userLogin);

export default router;
