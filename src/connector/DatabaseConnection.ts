import { Sequelize } from "sequelize";
import { AppParameter } from '../utils/env/AppParameter';

export class DatabaseConnection
{
    private static instance:DatabaseConnection;
    private static sequelize: Sequelize;

    private constructor()
    {
        DatabaseConnection.sequelize = new Sequelize(
            AppParameter.PGDATABASE,
            AppParameter.PGUSER,
            AppParameter.PGUSERPSW,
            {
                host: AppParameter.PGHOST,
                dialect: 'postgres'
            }
        );
    }

    public static getInstance(): Sequelize
    {
        if(!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.sequelize;
    }
    public static async authenticate(): Promise<void>
    {
        try
        {
            await DatabaseConnection.sequelize.authenticate();
            console.log('Connection has been established successfully.');
        }
        catch (error)
        {
            console.error('Unable to connect to the database:', error);
        }
    }
}