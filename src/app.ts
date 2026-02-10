import express from "express";
import { catchAllRoutes, logError, errorHandler } from "./middlewares/error_middlewares";
import adminRouter from "./routes/adminRoutes";
import navPlanRouter from "./routes/navPlanRoutes";
import noAuthRouter from "./routes/noAuthRoutes";
import noNavZoneRouter from "./routes/noNavZoneRoutes";

// app initialization
export const app = express();

app.use(express.json());

app.use('/users', adminRouter)
app.use('/login', noAuthRouter);
app.use('/navplans', navPlanRouter)
app.use('/nonavzones', noNavZoneRouter)

app.use(catchAllRoutes);
app.use(logError);
app.use(errorHandler);
