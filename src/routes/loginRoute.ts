import { Router } from "express";
import { body, check } from "express-validator";
import { ILogin } from "../@types/ILogin";
import { AuthController } from "../controllers/LoginController";
import { finalizeValidation, loginValidationRules } from "../middlewares/login_validation";
import { httpErrorHandler } from "../middlewares/error_middlewares";

const router = Router();
const authController = new AuthController();

router.post('/', loginValidationRules, finalizeValidation, httpErrorHandler, authController.login);

export default router;