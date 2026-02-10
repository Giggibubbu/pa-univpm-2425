import { Router } from "express";
import { NoAuthController } from "../controllers/NoAuthController.js";
import { finalizeLoginValidation, loginValidationRules } from "../middlewares/auth_middlewares.js";
import { NoAuthService } from "../services/NoAuthService.js";
import { UserDAO } from "../dao/UserDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";

const noAuthRouter = Router();
const userDao = new UserDAO();
const noNavZoneDao = new NoNavZoneDAO();
const authService = new NoAuthService(userDao, noNavZoneDao);
const authController = new NoAuthController(authService);

noAuthRouter.post('/', loginValidationRules, finalizeLoginValidation, authController.login);

export default noAuthRouter;