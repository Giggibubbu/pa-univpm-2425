import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { finalizeLoginValidation, loginValidationRules } from "../middlewares/auth_middlewares.js";
import { AuthService } from "../services/AuthService.js";
import { UserDAO } from "../dao/UserDAO.js";

const authRouter = Router();
const userDao = new UserDAO();
const authService = new AuthService(userDao);
const authController = new AuthController(authService);

authRouter.post('/', loginValidationRules, finalizeLoginValidation, authController.login);

export default authRouter;