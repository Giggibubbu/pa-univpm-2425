import { Router } from "express";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { OperatorRoleService } from "../services/OperatorRoleService.js";
import { OperatorRoleController } from "../controllers/OperatorRoleController.js";
import { operatorRoleValidation } from "../middlewares/auth_middlewares.js";
import { finalizeNoNavZoneCreation, finalizeNoNavZoneDelete, finalizeNoNavZoneUpdate, noNavZoneCreationValidation, noNavZoneDeleteValidation, noNavZoneUpdateValidation } from "../middlewares/nonavzones_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";
import { NoAuthService } from "../services/NoAuthService.js";
import { NoAuthController } from "../controllers/NoAuthController.js";

const noNavZoneRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const noAuthRoleService = new NoAuthService(userDao, noNavZoneDao);
const opRoleService = new OperatorRoleService(userDao, navPlanDao, noNavZoneDao);
const noAuthRoleController = new NoAuthController(noAuthRoleService);
const opRoleController = new OperatorRoleController(opRoleService);


noNavZoneRouter.get('/', noAuthRoleController.view)
noNavZoneRouter.use(operatorRoleValidation)
noNavZoneRouter.post('/', noNavZoneCreationValidation, finalizeNoNavZoneCreation, opRoleController.createNoNavZone)
noNavZoneRouter.patch('/:id', noNavZoneUpdateValidation, finalizeNoNavZoneUpdate, opRoleController.updateNoNavZone)
noNavZoneRouter.delete('/:id', noNavZoneDeleteValidation, finalizeNoNavZoneDelete, opRoleController.deleteNoNavZone)





export default noNavZoneRouter;