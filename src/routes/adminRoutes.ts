import { Router } from "express";
import { adminRoleValidation } from "../middlewares/auth_middlewares.js";
import { UserDAO } from "../dao/UserDAO.js";
import { AdminRoleService } from "../services/AdminRoleService.js";
import { AdminRoleController } from "../controllers/AdminRoleController.js";
import { finalizeChargeUserToken, validateChargeUserToken } from "../middlewares/admin_middlewares.js";

const adminRouter = Router();
const userDao = new UserDAO();
const adminRoleService = new AdminRoleService(userDao);
const adminRoleController = new AdminRoleController(adminRoleService);



adminRouter.use(adminRoleValidation)
adminRouter.patch('/:id', validateChargeUserToken, finalizeChargeUserToken, adminRoleController.load)





export default adminRouter;