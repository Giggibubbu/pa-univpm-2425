import { Sequelize } from "sequelize";
import { PGDATABASE, PGUSER, PGUSERPSW, PGHOST } from "../utils/env/app_parameters";

/**
 * Classe che implementa il pattern Singleton per la connessione al database PostgreSQL
 * tramite Sequelize.
 * L'oggetto viene istanziato alla fine del file e esportato, così che l'OrmModels possa
 * utilizzarlo per l'autenticazione al database e la definizione dei modelli nei vari DAO.
 */
export class SequelizeDbConnection
{
    private static instance:SequelizeDbConnection|null = null;
    private sequelize: Sequelize;

    /**
     * Inizializza l'istanza di Sequelize utilizzando le variabili d'ambiente.
     * Il costruttore è privato per impedire l'istanziazione multipla e garantire
     * l'integrità del pattern Singleton.
     */
    private constructor()
    {
        this.sequelize = new Sequelize(
            PGDATABASE,
            PGUSER,
            PGUSERPSW,
            {
                host: PGHOST,
                dialect: 'postgres'
            }
        );
    }

    /**
     * Recupera l'istanza unica della connessione al database.
     * Se l'istanza non esiste, viene creata; altrimenti viene restituita quella già attiva.
     * @returns L'istanza dell'ORM Sequelize pronta per l'esecuzione delle query.
     */

    public static getInstance(): Sequelize
    {
        if(!SequelizeDbConnection.instance) {
            SequelizeDbConnection.instance = new SequelizeDbConnection();
        }
        return SequelizeDbConnection.instance.sequelize;
    }

}

export const sequelize = SequelizeDbConnection.getInstance();