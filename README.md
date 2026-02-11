# Backend per gestione navigazione marina autonoma

Realizzazione di un backend per sostenere l'esame pratico di Programmazione avanzata (A.A 2024/2025) del corso di Laurea Magistrale
in Ingegneria Informatica e dell'Automazione (LM-32) tenuto presso l'Università Politecnica delle Marche.

1. [🎯 Obiettivo del Progetto](#-obiettivo-del-progetto)
2. [🏗 Progettazione](#-progettazione)
   - [Casi d'Uso](#casi-duso)
   - [Diagrammi di Sequenza](#diagrammi-di-sequenza)
3. [🧩 Design Pattern Utilizzati](#-design-pattern-utilizzati)
4. [🛠 Tecnologie Utilizzate](#-tecnologie-utilizzate)
5. [🐳 Avvio del Progetto (Docker)](#-avvio-del-progetto-docker)
   - [Configurazione Ambiente](#configurazione-ambiente)
   - [Comandi per l'Esecuzione](#comandi-per-lesecuzione)
6. [🧪 Test del Progetto](#-test-del-progetto)
   - [Test Middleware (Jest)](#test-middleware-jest)
   - [Test API (Postman/Curl)](#test-api-postmancurl)

## 🎯 Obiettivo del Progetto

L'obiettivo del progetto è lo sviluppo di un sistema backend che consenta di gestire diversi aspetti
che riguardano la navigazione marina autonoma, al fine di dimostrare di aver compreso 
i concetti e le buone pratiche illustrate nel corso.

In generale, il sistema deve poter essere in grado di gestire gli aspetti di:
- prenotazione di navigazione marina a fronte di un pagamento nel sistema di credito interno;
- visualizzazione e cancellazione di richieste/piani di navigazione;
- visualizzazione, creazione, modifica e cancellazione di aree di navigazione proibite;
- ricarica dei token utente;

Il backend deve prevedere quattro tipologie diverse di utente.
Ogni utenza è deputata alla gestione di uno degli aspetti dell'applicazione sopra citati.
Al fine di permettere al backend di autenticare le diverse utenze, occorre che esso sia dotato
di un sistema di autenticazione basato sul token JWT.

In particolare, le utenze e le relative funzionalità ad esse permesse all'interno dell'applicazione sono:
- **Utenza non autenticata**:
    - può autenticarsi;
    - visualizzare tutte le zone proibite di navigazione, sia quelle attive che non;
- **Utenza autenticata**:
    - utente (user):
        - può creare piani di navigazione a patto che:
            - abbia credito disponibile;
            - la data inizio del piano sia maggiore di 48h rispetto alla data di sottomissione della richiesta;
            - i punti della rotta non si trovino all'interno di aree vietate attive;
            - non ci siano piani di navigazione dello stesso utente che siano approvati/pending nello stesso periodo di quello oggetto della richiesta;
        - può cancellare piani di navigazione in stato di pending a patto che siano i suoi;
        - può visualizzare le proprie richieste/piani di navigazione in formato standard/JSON/XML filtrando eventualmente per
            - per data inizio navigazione;
            - per data fine navigazione;
            - per stato richiesta/piano di navigazione;
    - operatore (operator):
        - può approvare un piano di navigazione a patto che non si trovi già in stato di accepted/rejected/cancelled;
        - può rigettare un piano di navigazione a patto che non si trovi già in stato di accepted/rejected/cancelled;
        - può creare una zona di navigazione probita a patto che la sua rotta non confligga con una zona già presente;
        - può modificare zone di navigazione proibita;
        - può cancellare zone di navigazione proibita; 
    - amministratore (admin):
        - può ricaricare i token di uno specifico utente di una certa quantità.

A livello tecnologico, il backend deve essere sviluppato in **Typescript**, facendo utilizzo dei framework:
- **Express**: libreria per lo sviluppo di Web Applications e APIs;
- **Sequelize**: libreria **ORM** che permette il mapping di oggetti Typescript a oggetti fisici. (tabelle database)

Essendo l'RDBMS a scelta libera, il database utilizzato dal corrente progetto è **PostgreSQL**.

---
## 🧩 Design Pattern Utilizzati
Per garantire robustezza e manutenibilità, il progetto implementa i seguenti pattern:

* MVC - Model-View-Controller
* CoR - Chain of Responsibility
* Simple Factory
* Service Layer
* DAO - Data Access Object
* Singleton

### MVC - Model-View-Controller 
Il Design Pattern MVC introduce tre componenti, ognuna dedicata a uno scopo diverso.
La View ha lo scopo di effettuare il rendering della UI, il Controller risponde alle azioni che vengono effettuate sulla UI e il modello si occupa della logica di business e della gestione dello stato.

Nel backend in questione il design pattern MVC è stato implementato nella seguente maniera:
* **Model**: rappresentato da modelli Sequelize e interfacce dedicate alla rappresentazione delle entità di dominio; (navplans, nonavzone, users, ecc...)
* **Controller**: utilizzato per il recupero delle entità di dominio, parametri, query string presenti all'interno della richiesta HTTP per poi fare riferimento al Service Layer per le elaborazioni più legate alla logica applicativa. Al ritorno delle informazioni da parte di quest'ultimo, si occupa di produrre la Response HTTP in maniera appropriata rispetto alla rotta di provenienza. 
I controller sono stati suddivisi sostanzialmente per ruoli, tranne per quanto riguarda il controller nominato UserOpRoleController che implementa una funzionalità parzialmente condivisa tra due livelli di utenza.
* **View**: la view, essendo il progetto consistente in un backend, è rappresentata dalla struttura delle risorse in ingresso e in uscita al controller, veicolate per il tramite dell'interfaccia HTTP;

### CoR - Chain of Responsibility
CoR è un design pattern di tipo comportamentale che consente che una richiesta possa essere gestita da diversi gestori, ognuno specializzato nel proprio compito da svolgere su di essa.

CoR è stato implementato nei Middleware all'interno dell'applicazione, in particolare nei:
- Middleware di autenticazione: un esempio di Middleware di questo tipo è la `verifyJwt` all'interno del file `auth_middlewares.ts` nel repository corrente, che va a verificare la presenza e la validità del token JWT di autenticazione fornito dall'utente.
- Middleware di autorizzazione: un esempio di Middleware di questo tipo è la `checkRole` all'interno del file `auth_middlewares.ts`, che va a verificare il ruolo dell'utente autenticato contenuto all'interno del payload jwt. 
- Middleware di validazione e sanificazione: un esempio di Middleware di questo tipo è la `finalizeDelNavPlanReq` all'interno del file `navplan_middlewares.ts`, che consente di estrarre gli errori prodotti dalla catena di validazione dei middleware di validazione precedente o i dati validati.
- Middleware di gestione centralizzata errori: un esempio di Middleware di questo tipo è l'`errorHandler` definito all'interno del file `error_middlewares.ts`, che consente di individuare l'istanza dell'errore lanciato da Middleware/Controller presenti in un punto precedente della catena di responsabilità, affinchè esso possa generare una risposta HTTP appropriata. 

### Simple Factory
Factory è un design pattern creazionale che fornisce una interfaccia per creare oggetti in una superclasse, permettendo alle sottoclassi di modificare il tipo di oggetto che verrà creato.

L'implementazione presente nel backend, può essere ricondotta più a una Simple Factory, ossia una classe statica con un metodo statico che genera oggetti custom a seconda dei valori degli argomenti passati.
Su segnalazione di errore di ESLint sulle classi statiche, si è scelto di implementare una funzione esportata che prende come argomento il nome dell'errore applicativo (o del nome dell'operazione avvenuta con successo) affinchè essa generi una risposta HTTP adeguata ad esso. (nel caso degli errori, statusCode e message coerenti con il nome dell'errore)
Queste funzioni factory (`errorFactory` e `successFactory`) fanno riferimento a dei Record Typescript in cui è contenuta la struttura del messaggio HTTP che deve essere prodotta dalle Factory.  

### Service Layer
Il Service Layer serve per astrarre la logica di business dalla logica di persistenza dei dati.
Solitamente infatti, rappresenta il layer più lontano rispetto alla persistenza dei dati dopo Repository e DAO.

Si è scelto di implementare il Service Layer e non il Repository per semplificare la struttura dell'architettura.
L'implementazione consiste in una classe a cui vengono iniettati i DAO di cui necessita per accedere alla persistenza dei dati e implementare le logiche di business.
Qui, diversamente dai controller, si è implementato una classe per ogni utenza applicativa. (es. user `UserRoleService`, operator `OperatorRoleService`, ecc...)

### DAO - Data Access Object
Il DAO viene utilizzato per l'astrazione delle operazioni di persistenza e per separare la logica di business da quella dell'accesso diretto ai dati.

Nel progetto ciò viene implementato attraverso le classi `NavPlanDAO`, `UserDAO` e `NoNavZoneDAO`.
Queste tre classi implementano un'interfaccia comune generica che stabilisce quali sono i metodi obbligatori e facoltativi, con i relativi argomenti e tipi di ritorno.
Inoltre, esse, alla loro istanziazione effettuano un test di autenticazione sul Database e valorizzano la proprietà privata interna dedicata alla memorizzazione del corrispondente modello Sequelize ritornato da un metodo statico della classe `OrmModels`.
### Singleton
Singleton è un design pattern creazionale che permette che l'istanza di una classe sia condivisa per tutte le componenti che ne necessitano nell'applicazione.

Il pattern è implementato all'interno del backend per quanto riguarda l'istanza di Sequelize che consente l'interfacciamento dell'applicazione web con il database.
In particolare la classe statica `SingletonDBConnection` è dotata di un metodo `getInstance` che controlla la valorizzazione della variabile privata interna dedicata a contenere l'istanza univoca di Sequelize.
Qualora non sia valorizzata, la `getInstance` invoca il costruttore privato e ritorna l'istanza dell'oggetto `sequelize` contenuta nella variabile, altrimenti effettua soltanto questa seconda operazione.
Il costruttore privato va ad istanziare l'oggetto Sequelize e può essere chiamato soltanto passando dal metodo `getInstance`, che è chiave del funzionamento del pattern in questione.
L'oggetto `SingletonDBConnection` viene istanziato all'interno di una variabile esportata chiamata `sequelize`, di cui `OrmModels` fa utilizzo per la connessione al database.

---
## API Reference
Prima di procedere all'illustrazione della fase di progettazione, si vuole elencare le API che il backend in questione mette a disposizione.
In particolare, di seguito verranno elencate le rotte con le funzionalità e ruolo dell'utenza ad esse associate.

### API Summary

| Rotta | Metodo HTTP | Ruolo autorizzato | Descrizione |
| :--- | :--- | :--- | :--- |
| `/login` | POST | Utente non autenticato | Rotta di autenticazione. |
| `/nonavzones` | GET | Utente non autenticato | Visualizza tutte le zone di navigazione proibite. |
| `/navplans` | POST | Utente (user) | Crea la richiesta di navigazione / piano di navigazione in stato di *pending*. |
| `/navplans?dateFrom=&dateTo&status=&format=` | GET | Utente (user) | Visualizza piani di navigazione con filtri opzionali su (stato, date inizio e fine) ed esportazione JSON/XML. |
| `/navplans/:id` | DELETE | Utente (user) | Cancellazione di una propria richiesta in stato *pending*. |
| `/navplans?status=` | GET | Operatore (user) | Visualizza i piani di navigazione di tutti gli utenti. (filtrabili eventualmente per stato) |
| `/navplans/:id` | PATCH | Operatore | Approvazione/Rigetto di una richiesta/piano di navigazione in stato *pending*. |
| `/nonavzones` | POST | Operatore | Creazione di una zona di navigazione proibita. |
| `/nonavzones/:id` | PATCH | Operatore | Aggiornamento di una zona proibita esistente. (anche di altri operatori) |
| `/nonavzones/:id` | DELETE | Operatore | Eliminazione di una zona proibita. (solo se creata inizialmente dall'operatore che ne fa richiesta) |
| `/users` | PATCH | Amministratore | Ricarica del credito (token) per un utente specifico che non sia operatore/admin. |

### API Reference Detail

Elencare payload e API una ad una.

## 🏗 Progettazione
In questa sezione vengono illustrati l'architettura logica e i flussi di sistema.
### Diagramma dei Casi d'Uso
![Use Case Diagram](./readme-content/pa2425-univpm-usecase.png)
### Diagrammi di Sequenza

#### POST /login (Utente non autenticato)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant AuthController
    participant AuthService
    participant UserDAO
    participant ErrorHandlerMiddleware
    
    %% Inizio
    Client->>App: POST /login

    App->>AuthMiddleware: finalizeLoginValidation(req, res)
    
    alt login validation failed
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.LOGIN_INVALID))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.LOGIN_INVALID)
        ErrorHandlerMiddleware-->>App: HTTP Error Response (400)
        App-->>Client: HTTP Error Response (400)
    end

    alt login validation success
        
        App ->> AuthController: login(req, res)
        AuthController ->> AuthService: loginUser(email)
        AuthService ->> UserDAO: read(email)

        alt user not found
            UserDAO -->> AuthService: null
            AuthService -->> AuthController: throws AppLogicError(AppErrorName.INVALID_CREDENTIALS)
            AuthController -->> App: next(AppLogicError(AppErrorName.INVALID_CREDENTIALS))
            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_CREDENTIALS)
            ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
            App -->> Client: HTTP Error Response (401)
        end
        
        alt user found
        UserDAO -->> AuthService: User
        AuthService ->> AuthService: comparePassword(req.password, user.password)
            alt wrong password
                AuthService -->> AuthController: throws AppLogicError(AppErrorName.INVALID_CREDENTIALS)
                AuthController -->> App: next(AppLogicError(AppErrorName.INVALID_CREDENTIALS))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_CREDENTIALS)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
                App -->> Client: HTTP Error Response (401)
            end
            alt correct password
                AuthService ->> AuthService: createJwt(user.email, user.role)
                AuthService -->> AuthController: JWT Token
                AuthController -->> App: HTTP Success Response (200) + HTTP Body: {JWT Token, User}
                App -->> Client: HTTP Success Response (200) + HTTP Body: JWT Token
            end
        end

    end
```




#### GET /nonavzones (Utente non autenticato)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant NoAuthController
    participant NoAuthService
    participant NoNavZoneDAO
    participant ErrorHandlerMiddleware

    Client ->> App: GET /nonavzones


    App ->> NoAuthController: view(res, req)
    NoAuthController ->> NoAuthService: viewNoNavZones()
    NoAuthService ->> NoNavZoneDAO: readAll()

    alt no navzone found
    NoNavZoneDAO -->> NoAuthService: []
    NoAuthService -->> NoAuthController: throws new AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND)
    NoAuthController -->> App: AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND)
    App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND)
    ErrorHandlerMiddleware -->> App: HTTP Error Response (404)
    App -->> Client: HTTP Error Response (404)
    end 
    alt at least one navzone found
    NoNavZoneDAO -->> NoAuthService: [NoNavZones]
    NoAuthService -->> NoAuthController: [NoNavZones]
    NoAuthController -->> App: HTTP Success Response (200) + [NoNavZones]
    App -->> Client: HTTP Success Response + [NoNavZones]

    end
```

#### POST /navplans (Utente)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant NavPlanMiddleware
    participant UserRoleController
    participant UserRoleService
    participant UserDAO
    participant NavPlanDAO
    participant NoNavZoneDAO
    participant ErrorHandlerMiddleware

    Client->>App: POST /navplans

    App->>AuthMiddleware: verifyJwt(req, res)
    
    alt invalid jwt
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end

    alt valid jwt
        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(req, res)

        alt invalid role
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)

        end

        alt valid role
            AuthMiddleware -->> App: next()
            App ->> NavPlanMiddleware: finalizeNavPlanCreateReq(req, res)

            alt invalid navplan request
                NavPlanMiddleware -->> App: next(AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end

            alt valid navplan request
                
                NavPlanMiddleware -->> App: next()
                App ->> UserRoleController: create(res, req)
                UserRoleController ->> UserRoleService: createNavPlan(req.jwt, req.navPlan)
                UserRoleService ->> UserRoleService: checkAndDecreaseTokens(userJwt.email, TokenPayment.REQ_TOTAL_COST)
                UserRoleService ->> UserDAO: read(email)
                UserDAO -->> UserRoleService: User
                alt insufficient token
                    UserRoleService -->> UserRoleService: checkAndDecreaseTokens throws AppLogicError(AppErrorName.INSUFFICIENT_TOKENS)
                    UserRoleService -->> UserRoleController: AppLogicError(AppErrorName.INSUFFICIENT_TOKENS)
                    UserRoleController -->> App: next(AppLogicError(AppErrorName.INSUFFICIENT_TOKENS))
                    App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INSUFFICIENT_TOKENS)
                    ErrorHandlerMiddleware -->> App: HTTP Error Response (403)
                    App -->> Client: HTTP Error Response (403)
                end
                
                alt sufficient token
                    UserRoleService ->> UserDAO: update(user)
                    UserDAO -->> UserRoleService: User
                    UserRoleService -->> UserRoleService: checkAndDecreaseTokens returns User
                    
                    UserRoleService ->> UserRoleService: checkReqDateStart(navPlan)
                    alt invalid navplan date begin
                        UserRoleService -->> UserRoleService: checkReqDateStart returns false
                        UserRoleService ->> UserRoleService: addToken(user.email, TokenPayment.NAVPLAN_INVALID_REFUND)
                        UserRoleService ->> UserDAO: update(user)
                        UserDAO -->> UserRoleService: User
                        UserRoleService -->> UserRoleService: addToken returns void
                        UserRoleService -->> UserRoleController: throws AppLogicError(AppErrorName.INVALID_NAVPLAN_DATE)
                        UserRoleController -->> App: next(AppLogicError(AppErrorName.INVALID_NAVPLAN_DATE))
                        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_NAVPLAN_DATE)
                        ErrorHandlerMiddleware -->> App: HTTP Error Response (403)
                    end

                    alt valid navplan date begin
                        UserRoleService -->> UserRoleService: checkReqDateStart returns true
                        UserRoleService ->> UserRoleService: checkInNoNavZone(navPlan)
                        UserRoleService ->> NoNavZoneDAO: readAll(noNavZoneQueryFilters)
                        NoNavZoneDAO -->> UserRoleService: [{NoNavZones}]

                        alt navplan with at least one point in one no_nav_zone
                            UserRoleService -->> UserRoleService: checkInNoNavZone returns true
                            UserRoleService ->> UserRoleService: addToken(user.email, TokenPayment.NAVPLAN_INVALID_REFUND)
                            UserRoleService ->> UserDAO: update(user)
                            UserDAO -->> UserRoleService: User
                            UserRoleService -->> UserRoleService: addToken returns void
                            UserRoleService -->> UserRoleController: throws AppLogicError(AppErrorName.FORBIDDEN_AREA_ERROR)
                            UserRoleController -->> App: next(AppLogicError(AppErrorName.FORBIDDEN_AREA_ERROR))
                            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.FORBIDDEN_AREA_ERROR)
                            ErrorHandlerMiddleware -->> App: HTTP Error Response (403)
                            App -->> Client: HTTP Error Response (403)
                        end

                        alt navplan not in no no_nav_zones (navplan is valid)
                            UserRoleService -->> UserRoleService: checkInNoNavZone returns false
                            UserRoleService ->> UserRoleService: checkUserNavPlanConflict(navPlan)
                            UserRoleService ->> NavPlanDAO: readAll(noNavZoneQueryFilters)
                            NavPlanDAO -->> UserRoleService: [{NavPlans}]

                            alt navplan conflict
                                UserRoleService -->> UserRoleService: checkUserNavPlanConflict(navPlan) returns true
                                UserRoleService ->> UserRoleService: addToken(user.email, TokenPayment.NAVPLAN_INVALID_REFUND)
                                UserRoleService ->> UserDAO: update(user)
                                UserDAO -->> UserRoleService: User
                                UserRoleService -->> UserRoleService: addToken returns void
                                UserRoleService -->> UserRoleController: throws AppLogicError(AppErrorName.NAVPLAN_CONFLICT)
                                UserRoleController -->> App: next(AppLogicError(AppErrorName.NAVPLAN_CONFLICT))
                                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NAVPLAN_CONFLICT)
                                ErrorHandlerMiddleware -->> App: HTTP Error Response (409)
                                App -->> Client: HTTP Error Response (409)
                            end
                            alt no navplan conflict
                                UserRoleService -->> UserRoleService: checkUserNavPlanConflict(navPlan) returns false
                                UserRoleService -->> UserRoleController: NavPlan
                                UserRoleController -->> App: HTTP Success Response (201) + {NavPlan,User}
                                App -->> Client: HTTP Success Response (201) + {NavPlan,User}
                            end

                        end
                        
                    end
                end
            end
        end
    end
```


#### GET /navplans?dateFrom=&dateTo=&status=&format= (Utente e Operatore)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant NavPlanMiddleware
    participant UserOpRoleController
    participant UserRoleService/OperatorRoleService
    participant NavPlanDAO
    participant ErrorHandlerMiddleware

    Client ->> App: GET /navplans?date_from=27012023&date_to=30012023&status=pending&format=xml | GET /navplans?status=pending

    App->>AuthMiddleware: verifyJwt(req, res)
    
    alt invalid jwt
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end

    alt valid jwt
        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(jwt.role)

        alt invalid role
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)

        end

        alt valid role
            AuthMiddleware -->> App: next()
            App ->> NavPlanMiddleware: finalizeViewNavPlanReq(req, res)
        
            alt invalid view request
                NavPlanMiddleware -->> App: next(AppLogicError(AppErrorName.NAVPLAN_VIEW_REQ_INVALID))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NAVPLAN_VIEW_REQ_INVALID)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end

            alt valid view request
                NavPlanMiddleware -->> App: next()
                App ->> UserOpRoleController: view(res, req)
                UserOpRoleController ->> UserRoleService/OperatorRoleService: viewNavPlans(jwt.email, req.navplan) | viewNavPlans(req.navplan) 
                UserRoleService/OperatorRoleService ->> NavPlanDAO: readAll(navplan)
                alt no navplans found
                NavPlanDAO -->> UserRoleService/OperatorRoleService: []
                UserRoleService/OperatorRoleService -->> UserOpRoleController: throws AppLogicError(AppErrorName.NAVPLAN_VIEW_NOT_FOUND)
                UserOpRoleController -->> App: AppLogicError(AppErrorName.NAVPLAN_VIEW_NOT_FOUND)
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NAVPLAN_VIEW_NOT_FOUND)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (404)
                App -->> Client: HTTP Error Response (404)
                end

                alt navplans found
                    NavPlanDAO -->> UserRoleService/OperatorRoleService: [NavPlans]
                    UserRoleService/OperatorRoleService -->> UserOpRoleController: [NavPlans]
                    UserOpRoleController -->> App: HTTP Success Reponse (200) + [NavPlans]
                    App -->> Client: HTTP Success Response (200) + [NavPlans]
                end
            end
        end

    end
```

#### DELETE /navplans/:id (Utente)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant NavPlanMiddleware
    participant UserRoleController
    participant UserRoleService
    participant UserDAO
    participant NavPlanDAO
    participant ErrorHandlerMiddleware

    Client ->> App: DELETE /navPlan/:id
    App ->> AuthMiddleware: NavPlanMiddleware: verifyJwt(req, res)

    alt invalid jwt | jwt expired
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware ->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end
    
    alt valid jwt
        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(req, res)

        alt invalid role
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
        end

        alt valid role

            AuthMiddleware -->> App: next()
            App ->> NavPlanMiddleware: validateDelReq(res, req)
            
            alt invalid delete request
                NavPlanMiddleware -->> App: next(AppLogicError(AppErrorName.NAVPLAN_DEL_REQ_INVALID))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NAVPLAN_DEL_REQ_INVALID)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end

            alt valid delete request
                NavPlanMiddleware -->> App: next()
                App ->> UserRoleController: delete(req.jwt.email,navPlan.id)
                UserRoleController ->> UserRoleService: deleteNavPlan(req.jwt.email, req.navPlan.id)
                UserRoleService ->> UserDAO: read(email)
                UserDAO -->> UserRoleService: User
                UserRoleService ->> NavPlanDAO: read(navPlanId)

                alt navplan does not exists
                    NavPlanDAO -->> UserRoleService: null
                    UserRoleService -->> UserRoleController: throws AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND)
                    UserRoleController -->> App: AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND)
                    App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND)
                    ErrorHandlerMiddleware -->> App: HTTP Error Response (404)
                    App -->> Client: HTTP Error Response (404)
                end

                alt navplan exists
                        alt user is not owner
                            NavPlanDAO -->> UserRoleService: NavPlan
                            UserRoleService -->> UserRoleController: throws AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE)
                            UserRoleController -->> App: next(AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE))
                            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE)
                            ErrorHandlerMiddleware -->> App: HTTP Error Response (403)
                            App -->> Client: HTTP Error Response (403)
                        end

                        alt user is owner
                            alt navPlan not in pending state
                                NavPlanDAO -->> UserRoleService: NavPlan
                                UserRoleService -->> UserRoleController: throws AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE)
                                UserRoleController -->> App: AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE)
                                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE)
                                ErrorHandlerMiddleware -->> App: HTTP Error Response (403)
                                App -->> Client: HTTP Error Response (403)
                            end
                            alt state pending
                                UserRoleService ->> NavPlanDAO: update(req.navPlan.id)
                                NavPlanDAO -->> UserRoleService: NavPlan
                                UserRoleService -->> UserRoleController: void
                                UserRoleController -->> App: HTTP Success Reponse (204)
                                App -->> Client: HTTP Success Reponse (204)
                            end
                        end
                end
            end
        end

    end

```

#### PATCH /navplans/:id (Operatore)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant NavPlanMiddleware
    participant OperatorRoleController
    participant OperatorRoleService
    participant NavPlanDAO
    participant ErrorHandlerMiddleware

    Client ->> App: PATCH /navplans/:id
    App ->> AuthMiddleware: verifyJwt(req, res)

    alt invalid jwt
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end

    alt valid jwt
        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(req, res)

        alt invalid role
            AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
            ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
            App -->> Client: HTTP Error Response (401)
        end

        alt valid role
            AuthMiddleware -->> App: next()
            App ->> NavPlanMiddleware: finalizeNavPlanUpd(res, req)


            alt invalid approve request
                NavPlanMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_NAVPLAN_UPDATE_REQ))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_NAVPLAN_UPDATE_REQ)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end

            alt valid approve request
                NavPlanMiddleware -->> App: next()
                App ->> OperatorRoleController: approve(res, req)
                OperatorRoleController ->> OperatorRoleService: updateNavPlan(req.navPlan)
                OperatorRoleService ->> NavPlanDAO: read(navPlan.id)
                

                alt no navplan found
                        NavPlanDAO -->> OperatorRoleService: null
                        OperatorRoleService -->> OperatorRoleController: throws AppLogicError(AppErrorName.NAVPLAN_UPD_NOT_FOUND)
                        OperatorRoleController -->> App: next(AppLogicError(AppErrorName.NAVPLAN_UPD_NOT_FOUND))
                        App ->> ErrorHandlerMiddleware: 
                        ErrorHandlerMiddleware -->> App: HTTP Error Response (404)
                        App -->> Client: HTTP Error Response (404)
                end

                alt navplan found
                    NavPlanDAO -->> OperatorRoleService: NavPlan

                    alt navplan in approved|rejected|cancelled state
                        OperatorRoleService -->> OperatorRoleController: throws AppErrorLogic(AppErrorName.FORBIDDEN_NAVPLAN_UPDATE)
                        OperatorRoleController -->> App: AppErrorLogic(AppErrorName.FORBIDDEN_NAVPLAN_UPDATE)
                        App ->> ErrorHandlerMiddleware: AppErrorLogic(AppErrorName.FORBIDDEN_NAVPLAN_UPDATE)
                        ErrorHandlerMiddleware -->> App: HTTP Error Response (403)
                        App -->> Client: HTTP Error Response (403)
                    end

                    alt navplan in pending state
                        OperatorRoleService ->> NavPlanDAO: update(navplan)
                        NavPlanDAO -->> OperatorRoleService: NavPlan
                        OperatorRoleService -->> OperatorRoleController: NavPlan
                        OperatorRoleController -->> App: HTTP Success Message (200) + NavPlan
                        App -->> Client: HTTP Success Message (200) + NavPlan
                    end
                end
            end
        end
    end
```

#### POST /nonavzones (Operatore)

```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant NoNavZoneMiddleware
    participant OperatorRoleController
    participant OperatorRoleService
    participant UserDAO
    participant NoNavZoneDAO
    participant ErrorHandlerMiddleware

    Client ->> App: POST /nonavzones
    App ->> AuthMiddleware: verifyJwt()

    alt invalid jwt
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end

    alt valid jwt
        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(req, res)

        alt invalid role
            AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
            ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
            App -->> Client: HTTP Error Response (401)
        end

        alt valid role

            AuthMiddleware -->> App: next()
            App ->> NoNavZoneMiddleware: finalizeNoNavZoneCreation(req, res)
            
            alt invalid creation req
                NoNavZoneMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_NONAVPLAN_CREATE_REQ))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_NONAVPLAN_CREATE_REQ)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end

            alt valid creation req
                NoNavZoneMiddleware -->> App: next()
                App ->> OperatorRoleController: createNoNavZone(res, req)
                OperatorRoleController ->> OperatorRoleService: createNoNavZone(req.jwt.email, req.noNavZone)
                OperatorRoleService ->> UserDAO: read(email)
                UserDAO -->> OperatorRoleService: User
                OperatorRoleService ->> NoNavZoneDAO: readAll(navPlanToSearch)

                alt existing nonavzone (same route)
                    NoNavZoneDAO -->> OperatorRoleService: NoNavZone
                    OperatorRoleService -->> OperatorRoleController: throws AppLogicError(AppErrorName.NONAVZONE_CONFLICT)
                    OperatorRoleController -->> App: next(AppLogicError(AppErrorName.NONAVZONE_CONFLICT))
                    App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NONAVZONE_CONFLICT)
                    ErrorHandlerMiddleware -->> App: HTTP Error Response (403)
                    App -->> Client: HTTP Error Response (403)
                end

                alt navzone not existing
                    NoNavZoneDAO -->> OperatorRoleService: []
                    OperatorRoleService ->> NoNavZoneDAO: create(nonavzone)
                    NoNavZoneDAO -->> OperatorRoleService: NoNavZone
                    OperatorRoleService -->> OperatorRoleController: NoNavZone
                    OperatorRoleController -->> App: HTTP Success Response (201) + NoNavZone
                    App -->> Client: HTTP Success Response (201) + NoNavZone
                end
            end
        end 
        
    end
```

#### PATCH /nonavzones/:id (Operatore)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant NoNavZoneMiddleware
    participant OperatorRoleController
    participant OperatorRoleService
    participant NoNavZoneDAO
    participant ErrorHandlerMiddleware

    Client ->> App: PATCH /nonavzones/:id
    App ->> AuthMiddleware: verifyJwt()

    alt invalid jwt
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end

    alt valid jwt
        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(req, res)

        alt invalid role
            AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
            ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
            App -->> Client: HTTP Error Response (401)
        end
        alt valid role

            AuthMiddleware -->> App: next()
            App ->> NoNavZoneMiddleware: finalizeNoNavZoneUpdate(req, res)
            
            alt invalid update req
                NoNavZoneMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_NONAVPLAN_UPDATE_REQ))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_NONAVPLAN_UPDATE_REQ)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end

            alt valid update req
                NoNavZoneMiddleware -->> App: next()
                App ->> OperatorRoleController: updateNoNavZone(res, req)
                OperatorRoleController ->> OperatorRoleService: updateNoNavZone(req.noNavZone)
                OperatorRoleService ->> NoNavZoneDAO: update(noNavZoneToSearch)
                
                alt not existing nonavzone
                    NoNavZoneDAO -->> OperatorRoleService: null
                    OperatorRoleService -->> OperatorRoleController: throws AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND)
                    OperatorRoleController -->> App: next(AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND))
                    App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND)
                    ErrorHandlerMiddleware -->> App: HTTP Error Response (404)
                    App -->> Client: HTTP Error Response (404)
                end

                alt navzone update success
                    NoNavZoneDAO -->> OperatorRoleService: NoNavZone
                    OperatorRoleService -->> OperatorRoleController: NoNavZone
                    OperatorRoleController -->> App: HTTP Success Response (200) + NoNavZone
                    App -->> Client: HTTP Success Response (200) + NoNavZone
                end
            end
        end
    end
```

#### DELETE /nonavzones/:id (Operatore)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant NoNavZoneMiddleware
    participant OperatorRoleController
    participant OperatorRoleService
    participant NoNavZoneDAO
    participant UserDAO
    participant ErrorHandlerMiddleware

    Client ->> App: DELETE /nonavzones/:id
    App ->> AuthMiddleware: verifyJwt()

    alt invalid jwt
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end

    alt valid jwt

        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(req, res)

        alt invalid role
            AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
            ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
            App -->> Client: HTTP Error Response (401)
        end
        
        alt valid role
            AuthMiddleware -->> App: next()
            App ->> NoNavZoneMiddleware: finalizeNoNavZoneDelete(req, res)
            
            alt invalid deletion req
                NoNavZoneMiddleware -->> App: next(AppLogicError(AppErrorName.NONAVPLAN_DEL_REQ_INVALID))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NONAVPLAN_DEL_REQ_INVALID)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end

            alt valid deletion req
                NoNavZoneMiddleware -->> App: next()
                App ->> OperatorRoleController: deleteNoNavZone(res, req)
                OperatorRoleController ->> OperatorRoleService: deleteNoNavZone(req.noNavZone, req.jwt?.email)
                OperatorRoleService ->> UserDAO: read(email)
                UserDAO --> OperatorRoleService: User
                OperatorRoleService ->> NoNavZoneDAO: delete(noNavZoneToDelete)
                
                alt not existing nonavzone
                    NoNavZoneDAO -->> OperatorRoleService: false
                    OperatorRoleService -->> OperatorRoleController: throws AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND)
                    OperatorRoleController -->> App: next(AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND))
                    App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND)
                    ErrorHandlerMiddleware -->> App: HTTP Error Response (404)
                    App -->> Client: HTTP Error Response (404)
                end

                alt navzone deletion success
                    NoNavZoneDAO -->> OperatorRoleService: 1
                    OperatorRoleService -->> OperatorRoleController: 1
                    OperatorRoleController -->> App: HTTP Success Response (204)
                    App -->> Client: HTTP Success Response (204)
                end
            end
        end 
        
    end
```

#### PATCH /users/:id (Amministratore)
```mermaid
sequenceDiagram
    actor Client
    participant App
    participant AuthMiddleware
    participant UserMiddleware
    participant AdminRoleController
    participant AdminRoleService
    participant UserDAO
    participant ErrorHandlerMiddleware

    Client ->> App: PATCH /users/:id

    App ->> AuthMiddleware: verifyJwt(req, res)
    alt invalid jwt
        AuthMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_JWT))
        App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_JWT)
        ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
        App -->> Client: HTTP Error Response (401)
    end
    alt valid jwt


        AuthMiddleware -->> App: next()
        App ->> AuthMiddleware: checkRole(req, res)

        alt invalid role
            AuthMiddleware -->> App: next(AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
            App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
            ErrorHandlerMiddleware -->> App: HTTP Error Response (401)
            App -->> Client: HTTP Error Response (401)
        end

        alt valid role
            AuthMiddleware ->> App: next()
            App ->> UserMiddleware: finalizeChargeUserToken(req, res)
            alt token req invalid
                UserMiddleware -->> App: next(AppLogicError(AppErrorName.INVALID_TOKEN_CHARGE_REQ))
                App ->> ErrorHandlerMiddleware: AppLogicError(AppErrorName.INVALID_TOKEN_CHARGE_REQ)
                ErrorHandlerMiddleware -->> App: HTTP Error Response (400)
                App -->> Client: HTTP Error Response (400)
            end
            alt token req valid
                UserMiddleware -->> App: next()
                App ->> AdminRoleController: load(req, res)
                AdminRoleController ->> AdminRoleService: chargeToken(user)
                AdminRoleService ->> UserDAO: update()
                
                alt not existing user
                    UserDAO -->> AdminRoleService: null
                    AdminRoleService -->> AdminRoleController: throws new AppLogicError(AppErrorName.USER_NOT_FOUND);
                    AdminRoleController -->> App: next(new AppLogicError(AppErrorName.USER_NOT_FOUND);)
                    App ->> ErrorHandlerMiddleware: new AppLogicError(AppErrorName.USER_NOT_FOUND);
                    ErrorHandlerMiddleware -->> App: HTTP Error Response (404)
                    App -->> Client: HTTP Error Response (404)
                end

                alt existing user
                    UserDAO -->> AdminRoleService: User
                    AdminRoleService -->> AdminRoleController: User
                    AdminRoleController -->> App: HTTP Success Response (200) + {User}
                    App -->> Client: HTTP Success Response (200) + {User}
                end
            end
        end
    end
```





## 🐳 Avvio del Progetto (Docker)
Il sistema è predisposto per essere avviato tramite **Docker Compose** per comporre i servizi necessari.

1.  **Variabili d'Ambiente**: Creare un file `.env` basato sull'esempio fornito, inserendo la chiave privata per i token JWT (RS256).
2.  **Comando di avvio**:
    ```bash
    docker-compose up --build
    ```
3.  **Inizializzazione**: All'avvio, vengono eseguiti automaticamente gli script di **seed** per popolare il database con i ruoli predefiniti e il credito iniziale per gli utenti di test.

---

## 🧪 Test del Progetto

### Test dei Middleware (Jest)
Sono stati sviluppati test unitari tramite **Jest** per tre middleware fondamentali:

1.  **Middleware di Autenticazione**: Verifica la validità del token JWT e l'estrazione dei privilegi di ruolo.
2.  **Middleware di Controllo Credito**: Blocca le richieste se l'utente ha un saldo inferiore a 2 token.
3.  **Middleware di Validazione Rotta**: Verifica che il set di waypoint fornito non intersechi aree identificate come **zone proibite**.

Per eseguire i test: `npm test`

### Test delle API
Le funzionalità possono essere verificate tramite **Postman** o comandi **curl**:

* **Pubblico**: Consultazione delle zone di navigazione proibita.
* **Auth**: Login e gestione sessione tramite JWT.
* **Piani di Navigazione**: Sottomissione, cancellazione (se in stato *pending*) e filtraggio dello storico.
* **Esportazione**: Verifica del corretto output in formato JSON e XML.

---

## 📂 Struttura della Repository
* `/src/controllers`: Gestione delle richieste e risposte HTTP.
* `/src/services`: Logica di business core e calcoli di validazione.
* `/src/middlewares`: Filtri di sicurezza e validatori di rotta/credito.
* `/src/db`: Configurazione Sequelize, modelli e implementazione DAO.