import express from "express";
import { APP_PORT } from "./utils/env/app_parameters.js";
import authRouter from "./routes/authRoute.js"
import { catchAllRoutes, errorHandler, logError } from "./middlewares/error_middlewares.js";

// app initialization
const app = express();


app.use(express.json());

app.use('/login', authRouter);

app.use(catchAllRoutes);
app.use(logError);
app.use(errorHandler);

app.listen(APP_PORT, () => {
  console.log(`Server running on http://localhost:${APP_PORT}`);
});