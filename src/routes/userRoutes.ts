import { Router } from "express";
import { finalizeLoginValidation, loginValidationRules, verifyJwt } from "../middlewares/noauth_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { UserRoleService } from "../services/UserRoleService.js";
import { UserRoleController } from "../controllers/UserRoleController.js";

const userRoleRouter = Router();
const userDao = new UserDAO();
const navPlanDao = new NavPlanDAO();
const noNavZoneDao = new NoNavZoneDAO();
const userRoleService = new UserRoleService(userDao, navPlanDao, noNavZoneDao);
const userRoleController = new UserRoleController(userRoleService);

userRoleRouter.post('/', verifyJwt, userRoleController.create);

export default userRoleRouter;