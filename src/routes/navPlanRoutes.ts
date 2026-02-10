import { Router } from "express";
import { operatorRoleValidation, userOpRoleValidation, userRoleValidation } from "../middlewares/auth_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { UserRoleService } from "../services/UserRoleService.js";
import { UserRoleController } from "../controllers/UserRoleController.js";
import { finalizeDelNavPlanReq, finalizeNavPlanCreateReq, navPlanDelReqValidator, navPlanReqCreationValidator, navPlanViewReqValidator, finalizeViewNavPlanReq, navPlanUpdReqValidator, finalizeNavPlanUpd } from "../middlewares/navplan_middlewares.js";
import { OperatorRoleService } from "../services/OperatorRoleService.js";
import { UserOpRoleController } from "../controllers/UserOpRoleController.js";
import { OperatorRoleController } from "../controllers/OperatorRoleController.js";

const navPlanRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const userRoleService = new UserRoleService(userDao, navPlanDao, noNavZoneDao);
const userRoleController = new UserRoleController(userRoleService);
const opRoleService = new OperatorRoleService(userDao, navPlanDao, noNavZoneDao);
const userOpRoleController = new UserOpRoleController(userRoleService, opRoleService);
const opRoleController = new OperatorRoleController(opRoleService);

// user
navPlanRouter.post('/', userRoleValidation, navPlanReqCreationValidator, finalizeNavPlanCreateReq, userRoleController.create);
navPlanRouter.delete('/:id', userRoleValidation, navPlanDelReqValidator, finalizeDelNavPlanReq, userRoleController.delete);

// user and operator
navPlanRouter.get('/', userOpRoleValidation, navPlanViewReqValidator, finalizeViewNavPlanReq, userOpRoleController.view);

// operator
navPlanRouter.patch('/:id', operatorRoleValidation, navPlanUpdReqValidator, finalizeNavPlanUpd, opRoleController.updateNavPlan)



export default navPlanRouter;