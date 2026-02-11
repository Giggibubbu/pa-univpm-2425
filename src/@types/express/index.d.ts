import { Request, Response } from "express";
import { ILogin } from "../../interfaces/http-requests/ILogin";
import { UserJwt } from "../../interfaces/jwt/UserJwt";
import { NavPlan } from "../../interfaces/http-requests/NavPlanRequest";
import { ViewNavPlanQS } from "../../interfaces/http-requests/ViewNavPlanQS";
import { NoNavZone } from "../../interfaces/http-requests/NoNavZoneRequest";
import { AdminChargeToken } from "../../interfaces/http-requests/AdminChargeToken";

/** Definizione di una richiesta arricchita da seguenti interfacce opzionali:
 * - ILogin: conterrà le credenziali di login dell'utente, se presenti.
 * - UserJwt: conterrà le informazioni del payload token JWT dell'utente, se presenti.
 * - NavPlan: conterrà i dati relativi a una richiesta/piano di navigazione, se presenti.
 * - ViewNavPlanQS: conterrà i filtri passati dall'utente relativi alla richiesta di 
 *   visualizzazione di una richiesta/piano di navigazione, se presenti.
 * - NoNavZone: conterrà i dati relativi a una zona proibita, se presenti.
 * - AdminChargeToken: conterrà i dati relativi ai token da aggiungere a un determinato utente.
 * Queste proprietà vengono aggiunte alla richiesta Express per consentire ai middleware e ai controller
 * di accedere facilmente a queste informazioni durante l'elaborazione delle richieste.
*/
declare global {
  namespace Express {
    interface Request {
      login?: ILogin;
      jwt?: UserJwt;
      navPlan?: NavPlan;
      viewNavPlanQS?:ViewNavPlanQS;
      noNavZone?: NoNavZone
      userToken?: AdminChargeToken
    }
  }
}