import { Router } from "express";
import { adminRoleValidation } from "../middlewares/auth_middlewares";
import { UserDAO } from "../dao/UserDAO";
import { AdminRoleService } from "../services/AdminRoleService";
import { AdminRoleController } from "../controllers/AdminRoleController";
import { finalizeChargeUserToken, validateChargeUserToken } from "../middlewares/admin_middlewares";

const adminRouter = Router();
const userDao = new UserDAO();
const adminRoleService = new AdminRoleService(userDao);
const adminRoleController = new AdminRoleController(adminRoleService);



adminRouter.use(adminRoleValidation)
adminRouter.patch('/:id', validateChargeUserToken, finalizeChargeUserToken, adminRoleController.load)





export default adminRouter;