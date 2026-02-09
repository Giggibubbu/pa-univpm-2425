import { Router } from "express";
import { userRoleValidation } from "../middlewares/auth_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { UserRoleService } from "../services/UserRoleService.js";
import { UserRoleController } from "../controllers/UserRoleController.js";
import { finalizeDelNavPlanReq, finalizeNavPlanCreateReq, navPlanDelReqValidator, navPlanReqCreationValidator, navPlanViewReqValidator, finalizeViewNavPlanReq } from "../middlewares/navplan_middlewares.js";
import { OperatorRoleService } from "../services/OperatorRoleService.js";
import { UserOpRoleController } from "../controllers/UserOpRoleController.js";

const navPlanRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const userRoleService = new UserRoleService(userDao, navPlanDao, noNavZoneDao);
const userRoleController = new UserRoleController(userRoleService);
const opRoleService = new OperatorRoleService(navPlanDao, noNavZoneDao);
const userOpRoleController = new UserOpRoleController(userRoleService, opRoleService);

navPlanRouter.use(userRoleValidation);
navPlanRouter.post('/', navPlanReqCreationValidator, finalizeNavPlanCreateReq, userRoleController.create);
navPlanRouter.delete('/:id', navPlanDelReqValidator, finalizeDelNavPlanReq, userRoleController.delete);
navPlanRouter.get('/', navPlanViewReqValidator, finalizeViewNavPlanReq, userOpRoleController.view);



export default navPlanRouter;