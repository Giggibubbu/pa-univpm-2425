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

    public static getInstance(): Sequelize
    {
        if(!SequelizeDbConnection.instance) {
            SequelizeDbConnection.instance = new SequelizeDbConnection();
        }
        return SequelizeDbConnection.instance.sequelize;
    }
    public static async authenticate(): Promise<void>
    {
        await this.instance?.sequelize.authenticate();
    }
}

export const sequelize = SequelizeDbConnection.getInstance();