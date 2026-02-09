import express from "express";
import { APP_PORT } from "./utils/env/app_parameters.js";
import noAuthRouter from "./routes/noAuthRoutes.js"
import { catchAllRoutes, errorHandler, logError } from "./middlewares/error_middlewares.js";
import navPlanRouter from "./routes/navPlanRoutes.js";

// app initialization
const app = express();

app.use(express.json());

app.use('/login', noAuthRouter);
app.use('/navplans', navPlanRouter)

app.use(catchAllRoutes);
app.use(logError);
app.use(errorHandler);

app.listen(APP_PORT, () => {
  console.log(`Server running on http://localhost:${APP_PORT}`);
});