import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.get("/user/google", AuthController.initiateGoogleLogin);
router.get("/user/google/callback", AuthController.processGoogleLogin);
router.post("/user/login", AuthController.userLogin);
router.post("/audit/login", AuthController.auditLogin);
router.post("/admin/register", AuthController.adminRegister);
router.post("/admin/login", AuthController.adminLogin);

export default router;
