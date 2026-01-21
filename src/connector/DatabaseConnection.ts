import { Sequelize } from "sequelize";
import { EnvVariable } from '../utils/env/EnvVariable';

export class DatabaseConnection
{
    private static instance:DatabaseConnection;
    private static sequelize: Sequelize;

    private constructor()
    {
        DatabaseConnection.sequelize = new Sequelize(EnvVariable.PGDATABASE, EnvVariable.PGUSER, EnvVariable.PGUSERPSW, {
            host: EnvVariable.PGHOST,
            dialect: 'postgres'
        });
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