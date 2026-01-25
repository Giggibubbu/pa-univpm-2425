import { Router } from "express";
import { body, check } from "express-validator";
import { ILogin } from "../@types/ILogin";
import { AuthController } from "../controllers/AuthController";
import { finalizeLoginValidation, loginValidationRules } from "../middlewares/auth_middlewares";
import { AuthService } from "../services/AuthService";

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/', loginValidationRules, finalizeLoginValidation, authController.login);

export default router;