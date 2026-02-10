import { Router } from "express";
import { NoAuthController } from "../controllers/NoAuthController";
import { finalizeLoginValidation, loginValidationRules } from "../middlewares/auth_middlewares";
import { NoAuthService } from "../services/NoAuthService";
import { UserDAO } from "../dao/UserDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";

const noAuthRouter = Router();
const userDao = new UserDAO();
const noNavZoneDao = new NoNavZoneDAO();
const authService = new NoAuthService(userDao, noNavZoneDao);
const authController = new NoAuthController(authService);

noAuthRouter.post('/', loginValidationRules, finalizeLoginValidation, authController.login);

export default noAuthRouter;