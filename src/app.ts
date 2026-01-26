import express from "express";
import { AppParameter } from "./utils/env/AppParameter";
import loginRoute from "./routes/authRoute"
import { catchAllRoutes, errorHandler, logError } from "./middlewares/error_middlewares";
import { DatabaseConnection } from "./connector/DatabaseConnection";
import { OrmModels } from "./connector/OrmModels";
import { UserDAO } from "./dao/UserDAO";

const app = express();

const pippo = async () => {console.log(await new UserDAO().read(1))}
pippo()
app.use(express.json());

app.use('/login', loginRoute);

app.use(catchAllRoutes);
app.use(logError);
app.use(errorHandler);

app.listen(AppParameter.APP_PORT, () => {
  console.log(`Server running on http://localhost:${AppParameter.APP_PORT}`);
});