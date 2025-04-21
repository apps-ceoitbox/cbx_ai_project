import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/user/login", AuthController.userLogin);

router.post("/admin/register", AuthController.adminRegister);
router.post("/admin/login", AuthController.adminLogin);

export default router;
