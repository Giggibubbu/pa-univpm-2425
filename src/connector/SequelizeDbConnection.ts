import { Sequelize } from "sequelize";
import { PGDATABASE, PGUSER, PGUSERPSW, PGHOST } from "../utils/env/app_parameters";

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