import express from "express";
import { APP_PORT } from "./utils/env/app_parameters";
import loginRoute from "./routes/authRoute"
import { catchAllRoutes, errorHandler, logError } from "./middlewares/error_middlewares";
import { UserDAO } from "./dao/UserDAO";
import { SequelizeDbConnection } from "./connector/SequelizeDbConnection";

const app = express();

app.use(express.json());

const pippo = async () => {
  console.log(await new UserDAO().read(1));
}
pippo()

app.use('/login', loginRoute);

app.use(catchAllRoutes);
app.use(logError);
app.use(errorHandler);
//noooo

app.listen(APP_PORT, () => {
  console.log(`Server running on http://localhost:${APP_PORT}`);
});