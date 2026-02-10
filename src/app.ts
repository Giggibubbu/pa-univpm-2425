import express from "express";
import { APP_PORT } from ;
import noAuthRouter from 
import { catchAllRoutes, errorHandler, logError } from ;
import navPlanRouter from ;
import noNavZoneRouter from ;
import adminRouter from ;

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

app.listen(APP_PORT, () => {
  console.log(`Server running on http://localhost:${APP_PORT}`);
});