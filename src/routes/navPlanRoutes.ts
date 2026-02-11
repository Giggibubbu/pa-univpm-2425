import { Router } from "express";
import { operatorRoleValidation, userOpRoleValidation, userRoleValidation } from "../middlewares/auth_middlewares";
import { UserDAO } from "../dao/UserDAO";
import { NavPlanDAO } from "../dao/NavPlanDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { UserRoleService } from "../services/UserRoleService";
import { UserRoleController } from "../controllers/UserRoleController";
import { finalizeDelNavPlanReq, finalizeNavPlanCreateReq, navPlanDelReqValidator, navPlanReqCreationValidator, navPlanViewReqValidator, finalizeViewNavPlanReq, navPlanUpdReqValidator, finalizeNavPlanUpd } from "../middlewares/navplan_middlewares";
import { OperatorRoleService } from "../services/OperatorRoleService";
import { UserOpRoleController } from "../controllers/UserOpRoleController";
import { OperatorRoleController } from "../controllers/OperatorRoleController";

/**
 * Express Router per la gestione dei Piani di Navigazione (NavPlans).
 * Definisce le rotte e i relativi middleware e controller ad esse applicati.
 */

const navPlanRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const userRoleService = new UserRoleService(userDao, navPlanDao, noNavZoneDao);
const userRoleController = new UserRoleController(userRoleService);
const opRoleService = new OperatorRoleService(userDao, navPlanDao, noNavZoneDao);
const userOpRoleController = new UserOpRoleController(userRoleService, opRoleService);
const opRoleController = new OperatorRoleController(opRoleService);

// Operazioni riservate ai profili con ruolo 'user'.

// Crea un nuovo piano di navigazione.
navPlanRouter.post('/', userRoleValidation, navPlanReqCreationValidator, finalizeNavPlanCreateReq, userRoleController.create);

// Elimina un piano di navigazione esistente tramite ID.
navPlanRouter.delete('/:id', userRoleValidation, navPlanDelReqValidator, finalizeDelNavPlanReq, userRoleController.delete);


// Operazioni accessibili sia a utenti standard che a operatori.

// Visualizza i piani di navigazione (con filtri opzionali).
navPlanRouter.get('/', userOpRoleValidation, navPlanViewReqValidator, finalizeViewNavPlanReq, userOpRoleController.view);


// Operazioni amministrative riservate ai profili con ruolo 'operator'.

// Aggiorna i dettagli di un piano di navigazione esistente.
navPlanRouter.patch('/:id', operatorRoleValidation, navPlanUpdReqValidator, finalizeNavPlanUpd, opRoleController.updateNavPlan)



export default navPlanRouter;