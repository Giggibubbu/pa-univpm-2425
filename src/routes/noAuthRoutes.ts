import { Router } from "express";
import { NoAuthController } from "../controllers/NoAuthController";
import { finalizeLoginValidation, loginValidationRules } from "../middlewares/auth_middlewares";
import { NoAuthService } from "../services/NoAuthService";
import { UserDAO } from "../dao/UserDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";

/**
 * Express Router per le operazioni pubbliche (No-Auth).
 * Gestisce principalmente l'autenticazione iniziale.
 */

const noAuthRouter = Router();
const userDao = new UserDAO();
const noNavZoneDao = new NoNavZoneDAO();
const authService = new NoAuthService(userDao, noNavZoneDao);
const authController = new NoAuthController(authService);

/**
 * Endpoint per l'autenticazione dell'utente (Login).
 * Riceve le credenziali, le valida tramite middleware e genera il token di autenticazione. 
**/

noAuthRouter.post('/', loginValidationRules, finalizeLoginValidation, authController.login);

export default noAuthRouter;