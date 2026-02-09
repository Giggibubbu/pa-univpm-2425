import { Router } from "express";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { OperatorRoleService } from "../services/OperatorRoleService.js";
import { OperatorRoleController } from "../controllers/OperatorRoleController.js";
import { operatorRoleValidation } from "../middlewares/auth_middlewares.js";
import { finalizeNoNavZoneCreation, noNavZoneCreationValidation } from "../middlewares/nonavzones_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";

const noNavZoneRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const opRoleService = new OperatorRoleService(userDao, navPlanDao, noNavZoneDao);
const opRoleController = new OperatorRoleController(opRoleService);

noNavZoneRouter.use(operatorRoleValidation)
noNavZoneRouter.post('/', noNavZoneCreationValidation, finalizeNoNavZoneCreation, opRoleController.createNoNavZone)
noNavZoneRouter.patch('/', opRoleController.updateNoNavZone)
noNavZoneRouter.delete('/', opRoleController.deleteNoNavZone)





export default noNavZoneRouter;