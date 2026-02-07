import { Router } from "express";
import { userRoleValidation } from "../middlewares/auth_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { UserRoleService } from "../services/UserRoleService.js";
import { UserRoleController } from "../controllers/UserRoleController.js";
import { verifyNavPlanCreateReq, navPlanReqCreationValidator } from "../middlewares/navplan_middlewares.js";

const userRoleRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const userRoleService = new UserRoleService(userDao, navPlanDao, noNavZoneDao);
const userRoleController = new UserRoleController(userRoleService);

userRoleRouter.use(userRoleValidation);
userRoleRouter.post('/', navPlanReqCreationValidator, verifyNavPlanCreateReq, userRoleController.create);

export default userRoleRouter;