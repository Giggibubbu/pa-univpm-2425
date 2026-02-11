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
| `/nonavzones/:id` | PATCH | Operatore | Aggiornamento di una zona proibita esistente. |
| `/nonavzones/:id` | DELETE | Operatore | Eliminazione di una zona proibita. |
| `/users/:id` | PATCH | Amministratore | Ricarica del credito (token) per un utente specifico. |

### API Reference Detail

Di seguito sono riportate le rotte HTTP con la relativa richiesta che possono elaborare.

#### POST /login

Rotta utilizzata per autenticare un utente.
L'utente deve fornire email e password nel corpo della richiesta.
In particolare, la password deve essere forte e cioè deve avere una lunghezza minima di 8 caratteri di cui:
- almeno un carattere minuscolo;
- almeno un carattere maiuscolo;
- almeno un numero;
- almeno un carattere speciale.
Se l'utente viene trovato nel database sulla base dell'indirizzo email e password forniti, allora viene generato il token jwt e fornito in uscita.

Entrambi i campi sono obbligatori, quindi devono essere inseriti nel body della richiesta HTTP, pena ricezione di errore di login invalido.

##### Richiesta
```
POST /login HTTP/1.1
Content-Type: application/json
```
###### Body
```
{
    "email": "{{USER_ROLE_EMAIL}}",
    "password": "{{USER_ROLE_PSW}}"
}
```
###### Success Response
```
{
    "statusCode": 200,
    "message": "Login avvenuto con successo.",
    "data": {
        "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzA4NDIxMDAsImV4cCI6MTc3MDg0NTcwMH0.egjGSDKg4zY_4Ngqgwf53en9wciLWSHJ_mQl5k9FT6QtIkNnzm-2F6QSdM0uJyRDKpLdz6zV-lujmA3PMVQGKrAWGi1Cw3g0DflS28MmDcc-y1FiIpT-RMbmQG9EkrSZZzH-5vYj-2oh-lJG24M9ZqicEB2W-JOTU--r-tu3tUZMoaNbRKEmnJjoY-zhz4_K8uP8CB7vVF--g_xBZPYl1OCQZ6I0hDYA4cj5ueGqCxYG-49kTQrFm0PihROVbLhzQk8B4JabuWcrPK20k5741hxt5o4CrZxYtZsnfa6bljQnDL-T2AjbdmIo4MpsHvuH0YPRu3v16jarZRcCislwi4h2eUU9LHiWD_q-I-kAJAa4KQ45xhpaXRrJnWnzfwiVuWsFnsqVzKXk6ePYd7hLGZy6EGytpEviDYVdyCUAbY3L4UcDT7CGJyqeAJ6Gh3SKwnE6oGIQygWF7ohgx2KfaHsIUYE7ouS5uuEl9eitYtMivXjl3Yl8Ao0Bcv8u-4xOlXM3oIItSfFjt_0aAdu8JKXucPg6Xj0zsoPoQFjzEg3vIGY8CwL3u6wbUFkPwcU6lz3euaXfxmBMN81il0DQr_VLElpcPCS0COaH8qq6wcOMVyObjOuQctJIBgJ33-LIHxZhhc-N-wVLiFiay5sVvWrE56gxQ3IUYKm9v3IWP5M",
        "user": {
            "id": 1,
            "email": "alice@example.com",
            "role": "user",
            "tokens": 5000
        }
    }
}
```

#### GET /nonavzones

Rotta utilizzata da tutti gli utenti, autenticati e non per ottenere tutte le zone di navigazione proibite, sia attive che non.

##### Richiesta
```
GET /nonavzones HTTP/1.1
Content-Type: application/json
```
###### Body
```
// no body
```
###### Success Response
```
{
    "statusCode": 200,
    "message": "La richiesta di visualizzazione dei piani di navigazione è terminata con successo.",
    "data": [
        {
            "id": 1,
            "operatorId": 3,
            "validityStart": null,
            "validityEnd": null,
            "route": [
                [
                    10,
                    41
                ],
                [
                    12,
                    42
                ]
            ]
        },
        {
            "id": 2,
            "operatorId": 3,
            "validityStart": "2025-01-01T00:00:00.000Z",
            "validityEnd": "2027-12-31T23:59:59.000Z",
            "route": [
                [
                    1,
                    50.5
                ],
                [
                    2,
                    51
                ]
            ]
        },
        {
            "id": 3,
            "operatorId": 3,
            "validityStart": "2020-01-01T00:00:00.000Z",
            "validityEnd": "2020-12-31T23:59:59.000Z",
            "route": [
                [
                    -73,
                    39
                ],
                [
                    -72,
                    40
                ]
            ]
        },
        {
            "id": 4,
            "operatorId": 3,
            "validityStart": "2050-01-01T00:00:00.000Z",
            "validityEnd": "2050-12-31T23:59:59.000Z",
            "route": [
                [
                    49,
                    -18
                ],
                [
                    51,
                    -16
                ]
            ]
        }
    ]
}
```

#### POST /navplans

Rotta dedicata all'utente autenticato con ruolo Utente per effettuare la creazione delle richieste/piani di navigazione.
I campi sono tutti obbligatori, dunque viene restituito un errore se non si rispetta il formato del body della richiesta di cui sotto.
Viene restituito inoltre errore se:
- Le date non sono formattate secondo lo standard ISO8601;
- Se la data è maggiore rispetto alla data odierna;
- Se la data di fine non è maggiore della data di inizio di almeno 30m;
- Se l'id del drone non è specificatamente di 10 caratteri;
- Se la rotta è formata da meno di tre punti;
- Se la rotta non è chiusa;
- Se sono presenti segmenti di lunghezza zero;
- Se negli array più interni il primo numero non rispetta i criteri per essere longitudine e il secondo numero non rispetta i criteri per essere latitudine;

##### Richiesta
```
POST /navplans HTTP/1.1
Authorization: Bearer <JWT>

```
###### Body
```
{
    "dateStart": "2100-06-23T15:30:00.000Z",
    "dateEnd": "2100-06-24T16:02:00.000Z",
    "droneId": "D423DMXC22",
    "route": [[1,2], [105,90], [1,2]]
}
```
###### Success Response
```
{
    "statusCode": 201,
    "message": "La richiesta di navigazione è stata creata con successo.",
    "data": {
        "navplan": {
            "id": 16,
            "submittedAt": "2026-02-11T20:47:16.352Z",
            "status": "pending",
            "dateStart": "2100-06-23T15:30:00.000Z",
            "dateEnd": "2100-06-24T16:02:00.000Z",
            "droneId": "D423DMXC22",
            "route": [
                [
                    1,
                    2
                ],
                [
                    105,
                    90
                ],
                [
                    1,
                    2
                ]
            ]
        },
        "user": {
            "email": "alice@example.com",
            "tokens": 4993
        }
    }
}
```

#### GET /navplans?dateFrom=&dateTo&status=&format=

Rotta dedicata all'utente autenticato con ruolo Utente e con ruolo Operatore.
Il ruolo utente ha a disposizione tutti i filtri mentre il ruolo Operatore soltanto uno, ossia lo status della richiesta/piano di navigazione.
La risposta che vedrà l'operatore sarà quindi quella nominata no-format di seguito.
Tutti i filtri sono opzionali.
Le date devono essere in formato ISO8601, lo status deve essere compreso nell'insieme di stati "pending", "cancelled", "approved", "rejected" e il format deve essere una stringa del tipo "xml" o "json" di minimo tre caratteri e massimo quattro.
Se viene specificato solo il parametro dateTo nella query string, vengono stampati i piani di navigazione inviati fino a quella data.
Se viene specificato solo il parametro dateFrom, vengono stampati i piani di navigazione inviati da quella data in poi.

##### Richiesta
```
GET /navplans?dateTo=2050-08-02&status=approved&dateFrom=2020-08-02&format=xml HTTP/1.1
Authorization: Bearer <JWT>
```
###### Body
```
no body
```
###### Success Response - xml
```
<?xml version="1.0"?>
<navPlans>
    <plan>
        <id>1</id>
        <submittedAt>2022-05-10T09:00:00.000Z</submittedAt>
        <status>approved</status>
        <dateStart>2022-05-15T10:00:00.000Z</dateStart>
        <dateEnd>2022-05-15T11:30:00.000Z</dateEnd>
        <droneId>DRONE-SEA1</droneId>
        <route>
            <point>
                <lon>18.1</lon>
                <lat>37.5</lat>
            </point>
            <point>
                <lon>18.15</lon>
                <lat>37.5</lat>
            </point>
            <point>
                <lon>18.125</lon>
                <lat>37.55</lat>
            </point>
            <point>
                <lon>18.1</lon>
                <lat>37.5</lat>
            </point>
        </route>
    </plan>
    <plan>
        <id>3</id>
        <submittedAt>2026-11-20T14:00:00.000Z</submittedAt>
        <status>approved</status>
        <dateStart>2026-12-05T10:00:00.000Z</dateStart>
        <dateEnd>2026-12-05T11:45:00.000Z</dateEnd>
        <droneId>DRONE-SEA1</droneId>
        <route>
            <point>
                <lon>18.3</lon>
                <lat>37.7</lat>
            </point>
            <point>
                <lon>18.32</lon>
                <lat>37.7</lat>
            </point>
            <point>
                <lon>18.32</lon>
                <lat>37.72</lat>
            </point>
            <point>
                <lon>18.3</lon>
                <lat>37.72</lat>
            </point>
            <point>
                <lon>18.3</lon>
                <lat>37.7</lat>
            </point>
        </route>
    </plan>
</navPlans>
```
###### Success Response - format=json
```
[
    {
        "id": 1,
        "submittedAt": "2022-05-10T09:00:00.000Z",
        "status": "approved",
        "motivation": null,
        "dateStart": "2022-05-15T10:00:00.000Z",
        "dateEnd": "2022-05-15T11:30:00.000Z",
        "droneId": "DRONE-SEA1",
        "route": [
            [
                18.1,
                37.5
            ],
            [
                18.15,
                37.5
            ],
            [
                18.125,
                37.55
            ],
            [
                18.1,
                37.5
            ]
        ]
    },
    {
        "id": 3,
        "submittedAt": "2026-11-20T14:00:00.000Z",
        "status": "approved",
        "motivation": null,
        "dateStart": "2026-12-05T10:00:00.000Z",
        "dateEnd": "2026-12-05T11:45:00.000Z",
        "droneId": "DRONE-SEA1",
        "route": [
            [
                18.3,
                37.7
            ],
            [
                18.32,
                37.7
            ],
            [
                18.32,
                37.72
            ],
            [
                18.3,
                37.72
            ],
            [
                18.3,
                37.7
            ]
        ]
    }
]
```
###### Success Response - no format
```
{
    "statusCode": 200,
    "message": "La richiesta di visualizzazione dei piani di navigazione è terminata con successo.",
    "data": {
        "navplans": [
            {
                "id": 1,
                "submittedAt": "2022-05-10T09:00:00.000Z",
                "status": "approved",
                "motivation": null,
                "dateStart": "2022-05-15T10:00:00.000Z",
                "dateEnd": "2022-05-15T11:30:00.000Z",
                "droneId": "DRONE-SEA1",
                "route": [
                    [
                        18.1,
                        37.5
                    ],
                    [
                        18.15,
                        37.5
                    ],
                    [
                        18.125,
                        37.55
                    ],
                    [
                        18.1,
                        37.5
                    ]
                ]
            },
            {
                "id": 3,
                "submittedAt": "2026-11-20T14:00:00.000Z",
                "status": "approved",
                "motivation": null,
                "dateStart": "2026-12-05T10:00:00.000Z",
                "dateEnd": "2026-12-05T11:45:00.000Z",
                "droneId": "DRONE-SEA1",
                "route": [
                    [
                        18.3,
                        37.7
                    ],
                    [
                        18.32,
                        37.7
                    ],
                    [
                        18.32,
                        37.72
                    ],
                    [
                        18.3,
                        37.72
                    ],
                    [
                        18.3,
                        37.7
                    ]
                ]
            }
        ]
    }
}
```
#### DELETE /navplans/:id

Rotta dedicata alla funzionalità di cancellazione dei piani di navigazione da parte del ruolo autenticato Utente.
L'utente dovrà obbligatoriamente inserire l'id della risorsa come HTTP param, altrimenti riceverà un errore di route not found.
L'id dovrà essere un numero intero.

##### Richiesta
```
DELETE /navplans/:id HTTP/1.1
Authorization: Bearer <JWT>
```
###### Body
```
no body
```
###### Success Response
```
Header status code: 204 (No Content)
```

#### PATCH /navplans/:id

Rotta dedicata all'operatore per approvare o rigettare una richiesta/piano di navigazione.
L'operatore può approvare/rigettare anche piani di altri operatori ma non può approvare/rigettare piani già in stato di approved/rejected/cancelled.
Il campo status è un campo obbligatorio che può assumere soltanto i valori "approved" e "rejected".
Il campo motivation è obbligatorio a seconda del valore del campo status.
Il body può essere composto soltanto dal campo status se il suo valore è "approved", altrimenti se "rejected" deve essere per forza inserito il campo motivation.
##### Richiesta
```
PATCH /navplans/:id HTTP/1.1
Authorization: Bearer <JWT>
```
###### Body
```
{
    "status": "rejected",
    "motivation": "Invalid request"
}
```
###### Success Response (approved)
```
{
    "statusCode": 200,
    "message": "Il piano di navigazione è stato modificato con successo.",
    "data": {
        "navplan": {
            "id": 15,
            "submittedAt": "2027-05-01T10:00:00.000Z",
            "status": "approved",
            "dateStart": "2027-05-10T14:00:00.000Z",
            "dateEnd": "2027-05-10T16:00:00.000Z",
            "droneId": "DRONE-SEA6",
            "route": [
                [
                    18.4,
                    37.38
                ],
                [
                    18.42,
                    37.4
                ],
                [
                    18.4,
                    37.42
                ],
                [
                    18.38,
                    37.4
                ],
                [
                    18.4,
                    37.38
                ]
            ]
        }
    }
}
```
#### POST /nonavzones

La rotta in questione è dedicata all'utente Operatore per la funzionalità di inserimento delle zone proibite.
I campi contenuti nel body di seguito sono tutti obbligatori.
È possibile valorizzare le **entrambe** le date con valore null per inserire una zona sempre attiva.
Qualora sia presente soltanto un campo data, si avrà un errore che segnala la non della richiesta.

##### Richiesta
```
POST /nonavzones HTTP/1.1
Authorization: Bearer <JWT>
```
###### Body
```
{
    "validityStart": "2027-01-01T00:00:00Z",
    "validityEnd": "2027-12-31T23:59:59Z",
    "route": [[56,89], [156,90]]
}
```
###### Success Response
```
{
    "statusCode": 201,
    "message": "L'area vietata è stata creata con successo.",
    "data": {
        "id": 5,
        "operatorId": 3,
        "validityStart": "2027-01-01T00:00:00.000Z",
        "validityEnd": "2027-12-31T23:59:59.000Z",
        "route": [
            [
                56,
                89
            ],
            [
                156,
                90
            ]
        ]
    }
}
```

#### PATCH /nonavzones/:id

La rotta in questione serve per permettere all'utente autenticato Operatore di poter aggiornare la data di validità delle zone proibite.
È obbligatorio inserire nel body entrambi i campi data e come param della richiesta un numero intero.
Per fare in modo di impostare una zona attiva, occorre inserire le due date impostate al valore null.

##### Richiesta
```
PATCH /nonavzones/:id HTTP/1.1
Authorization: Bearer <JWT>
```
###### Body
```
{
    "validityStart": "2027-01-31T23:59:59Z",
    "validityEnd": "2027-12-31T23:59:59Z"
}
```
###### Success Response
```
{
    "statusCode": 200,
    "message": "L'area vietata è stata aggiornata con successo.",
    "data": {
        "id": 2,
        "operatorId": 3,
        "validityStart": "2027-01-31T23:59:59.000Z",
        "validityEnd": "2027-12-31T23:59:59.000Z",
        "route": [
            [
                1,
                50.5
            ],
            [
                2,
                51
            ]
        ]
    }
}
```

#### DELETE /nonavzones/:id

Rotta autenticata che consente all'utente ruolo Operatore di cancellare una zona proibita.
Il param id da inserire è obbligatorio e deve essere un numero intero maggiore di zero.

##### Richiesta
```
DELETE /nonavzones/:id HTTP/1.1
Authorization: Bearer <JWT>
```
###### Body
```
no body
```
###### Success Response
```
Header status code: 204 (No Content)
```

#### PATCH /users/:id

Rotta autenticata che consente all'utente ruolo Amministratore di ricaricare il credito di un utente qualsiasi di una certa quantità.
Il campo tokenToAdd nel body della richiesta è obbligatorio e deve essere un numero intero maggiore di zero.

##### Richiesta
```
PATCH /nonavzones/:id HTTP/1.1
Authorization: Bearer <JWT>
```
###### Body
```
{
    "tokenToAdd": 2
}
```
###### Success Response
```
{
    "statusCode": 200,
    "message": "I token sono stati modificati con successo.",
    "data": {
        "user": {
            "id": 2,
            "email": "notoken@example.com",
            "role": "user",
            "tokens": 4
        }
    }
}
```















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
                UserDAO -->> OperatorRoleService: User
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





## 🐳 Istruzioni per l'avvio del backend (Docker)
Il sistema è predisposto per essere avviato tramite **Docker Compose** per comporre i servizi necessari.
1. **Clone del repository**: effettuare il git clone del repository.
```bash
git clone https://github.com/Giggibubbu/pa-univpm-2425.git
```
2.  **Variabili d'Ambiente**: Creare un file `.env` da inserire nella root di progetto basato sull'esempio fornito, inserendo la chiave privata per i token JWT (RS256).
Il JWT Token va inserito come stringa nella variabile JWT_SECRET su un'unica riga.
Di seguito è mostrato un esempio di file .env in cui sono presenti le variabili di ambiente da valorizzare:
```env
## PostgreSQL environment variables 
PGUSER=postgres
PGDATABASE=pa2425
PGHOST=pa-dbpg
PGPASSWORD=<password>
PGPORT=5432
## Application environment variables
NODE_ENV=production
APP_PORT=3000
JWT_SECRET="<jwt-private-key>"
```
3. Qualora non si abbia a disposizione una coppia di chiavi, occorre generarla con i comandi di seguito:
```bash
# Generazione chiave privata
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Generazione chiave pubblica
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub.pem
```
4. Successivamente inserire la chiave pubblica generata all'interno della cartella keys/ del progetto.
5. Effettuare il print della chiave privata per inserirla in una riga dentro il file .env
```bash
awk '{printf "%s\\n", $0}' jwtRS256.key
```
Copiare il risultato del comando al posto di "<jwt-private-key>" nel file .env di esempio illustrato sopra.
6.  **Comando di avvio** - recarsi nella cartella di progetto in cui è presente il docker-compose.yml e digitare sulle linea di comando:
    ```bash
    docker-compose up --build
    ```
7.  **Inizializzazione**: Attendere il download delle immagini e delle dipendenze di progetto. Subito dopo verranno verranno eseguiti automaticamente gli script di **seed** per popolare il database con i ruoli predefiniti, le zone proibite e alcuni piani di navigazione. Prima che il database sia up e running il servizio di node nel relativo container non verrà avviato grazie allo script wait-for-it.sh. Una volta che il server node si è avviato, sarà in ascolto di default sulla porta 3000 TCP, come impostato nel file .env di esempio di cui al punto 1.
8. **Stop dei servizi**: per stoppare il docker compose occorre digitare il seguente comando, che si accerta della cancellazione dei docker volumes associati ai container creati:
```bash
docker compose down --volumes
```

---

## 🧪 Test del Progetto

### Test dei Middleware (Jest)
Sono stati sviluppati test unitari tramite **Jest** per tre middleware fondamentali:

1.  **Middleware di Autenticazione**: Verifica la validità del token JWT.
2.  **Middleware di Autorizzazione**: Blocca la richiesta se non è previsto che un certo ruolo acceda a una rotta ad esso non dedicata. 
3.  **Middleware di gestione errori**: 

Per eseguire i test:
1. Entrare nel container tramite il seguente comando:
```bash
docker exec -it pa-web-node bash
```
2. Dall'interno del container e nella directory di lavoro, eseguire:
```bash
npm run test
```
### Test delle API
Le funzionalità possono essere verificate effettuando il run della collection **Postman** presente nella cartella collections:



---