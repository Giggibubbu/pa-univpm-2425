import { Router } from "express";
import { userRoleValidation } from "../middlewares/auth_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { UserRoleService } from "../services/UserRoleService.js";
import { UserRoleController } from "../controllers/UserRoleController.js";
import { verifyNavPlanReq, navPlanValidator } from "../middlewares/navplan_middlewares.js";

const userRoleRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const userRoleService = new UserRoleService(userDao, navPlanDao, noNavZoneDao);
const userRoleController = new UserRoleController(userRoleService);

userRoleRouter.use(userRoleValidation);
userRoleRouter.post('/', navPlanValidator, verifyNavPlanReq, userRoleController.create);

export default userRoleRouter;