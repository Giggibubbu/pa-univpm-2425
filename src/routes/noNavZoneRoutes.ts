import { Router } from "express";
import { NavPlanDAO } from "../dao/NavPlanDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { OperatorRoleService } from "../services/OperatorRoleService";
import { OperatorRoleController } from "../controllers/OperatorRoleController";
import { operatorRoleValidation } from "../middlewares/auth_middlewares";
import { finalizeNoNavZoneCreation, finalizeNoNavZoneDelete, finalizeNoNavZoneUpdate, noNavZoneCreationValidation, noNavZoneDeleteValidation, noNavZoneUpdateValidation } from "../middlewares/nonavzones_middlewares";
import { UserDAO } from "../dao/UserDAO";
import { NoAuthService } from "../services/NoAuthService";
import { NoAuthController } from "../controllers/NoAuthController";

/**
 * Express Router per la gestione delle zone proibite.
 * Gestisce la visualizzazione pubblica delle zone e le operazioni CRUD effettuabili dall'operatore.
 */

const noNavZoneRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const noAuthRoleService = new NoAuthService(userDao, noNavZoneDao);
const opRoleService = new OperatorRoleService(userDao, navPlanDao, noNavZoneDao);
const noAuthRoleController = new NoAuthController(noAuthRoleService);
const opRoleController = new OperatorRoleController(opRoleService);

/**
 * Visualizzazione delle zone proibite, accedibile pubblicamente.
**/ 
noNavZoneRouter.get('/', noAuthRoleController.view)

/**
 * Middleware di autorizzazione per le rotte successive, che richiedono privilegi di tipo 'operator'.
 */
noNavZoneRouter.use(operatorRoleValidation)

/**
 * Crea una nuova zona proibita.
**/
noNavZoneRouter.post('/', noNavZoneCreationValidation, finalizeNoNavZoneCreation, opRoleController.createNoNavZone)

/**
 * Aggiorna una zona proibita.
**/
noNavZoneRouter.patch('/:id', noNavZoneUpdateValidation, finalizeNoNavZoneUpdate, opRoleController.updateNoNavZone)

/**
 * Elimina una zona proibita.
**/
noNavZoneRouter.delete('/:id', noNavZoneDeleteValidation, finalizeNoNavZoneDelete, opRoleController.deleteNoNavZone)





export default noNavZoneRouter;