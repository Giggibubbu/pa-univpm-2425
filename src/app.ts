import express from "express";
import { EnvVariable } from "./utils/env/EnvVariable";
import loginRoute from "./routes/loginRoute"
import { catchAllRoutes, httpErrorHandler } from "./middlewares/error_middlewares";

const app = express();

app.use(express.json());

app.use('/login', loginRoute);

// catchAll di tutte le rotte non definite sopra
app.use(catchAllRoutes);
app.use(httpErrorHandler);

app.listen(EnvVariable.APP_PORT, () => {
  console.log(`Server running on http://localhost:${EnvVariable.APP_PORT}`);
});