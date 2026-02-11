import express from "express";
import { catchAllRoutes, logError, errorHandler } from "./middlewares/error_middlewares";
import usersRouter from "./routes/usersRoutes";
import navPlanRouter from "./routes/navPlanRoutes";
import noAuthRouter from "./routes/noAuthRoutes";
import noNavZoneRouter from "./routes/noNavZoneRoutes";

/**
 * Applicazione Express principale.
 * 
 * Configura:
 * - Middleware per il parsing JSON
 * - Routes per autenticazione, gestione utenti (admin role), piani di navigazione (user and operator roles)
 *   e zone proibite (operator role)
 * - Middleware di gestione errori centralizzata
 */


// Inizializzazione applicazione
export const app = express();

// Applicazione del middleware per parsing JSON a tutte le rotte successive.
app.use(express.json());

// Definizione delle rotte e dei router che si occuperanno di gestire Request e Response per le stesse.

app.use('/users', usersRouter)
app.use('/login', noAuthRouter);
app.use('/navplans', navPlanRouter)
app.use('/nonavzones', noNavZoneRouter)

// Definizione dei middleware generali per la gestione degli errori dell'applicazione.

app.use(catchAllRoutes);
app.use(logError);
app.use(errorHandler);
