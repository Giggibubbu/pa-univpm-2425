import express from "express";
import { AppParameter } from "./utils/env/AppParameter";
import loginRoute from "./routes/authRoute"
import { catchAllRoutes, errorHandler, logError } from "./middlewares/error_middlewares";

const app = express();

app.use(express.json());

app.use('/login', loginRoute);

app.use(catchAllRoutes);
app.use(logError);
app.use(errorHandler);
//noooo

app.listen(AppParameter.APP_PORT, () => {
  console.log(`Server running on http://localhost:${AppParameter.APP_PORT}`);
});