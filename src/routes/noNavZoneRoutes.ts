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