import { Sequelize } from "sequelize";
import { PGDATABASE, PGUSER, PGUSERPSW, PGHOST} from '../utils/env/app_parameters.js';

export class SequelizeDbConnection
{
    private static instance:SequelizeDbConnection;
    private static sequelize: Sequelize;

    private constructor()
    {
        SequelizeDbConnection.sequelize = new Sequelize(
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
        return SequelizeDbConnection.sequelize;
    }
    public static async authenticate(): Promise<void>
    {
        await SequelizeDbConnection.sequelize.authenticate();
    }
}