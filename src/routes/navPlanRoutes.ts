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