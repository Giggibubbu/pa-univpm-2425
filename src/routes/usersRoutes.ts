import { Router } from "express";
import { adminRoleValidation } from "../middlewares/auth_middlewares";
import { UserDAO } from "../dao/UserDAO";
import { AdminRoleService } from "../services/AdminRoleService";
import { AdminRoleController } from "../controllers/AdminRoleController";
import { finalizeChargeUserToken, validateChargeUserToken } from "../middlewares/user_middlewares";

/**
 * Express Router per la gestione delle operazioni sulla risorsa utente.
 */

const usersRouter = Router();
const userDao = new UserDAO();
const adminRoleService = new AdminRoleService(userDao);
const adminRoleController = new AdminRoleController(adminRoleService);

/**
 * Middleware di sicurezza applicato a tutte le rotte di questo router.
 * Verifica che l'utente loggato abbia i permessi di amministratore.
 */

usersRouter.use(adminRoleValidation)

/**
 * Rotta per l'aggiornamento (caricamento) dei token di un utente specifico.
 */

usersRouter.patch('/:id', validateChargeUserToken, finalizeChargeUserToken, adminRoleController.load)





export default usersRouter;