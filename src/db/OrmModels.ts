import { SequelizeDbConnection } from '../connector/SequelizeDbConnection.js';
import { initModels } from '../models/sequelize-auto/init-models.js';

export class OrmModels
{

  public static initModels()
  {
    return initModels(SequelizeDbConnection.getInstance());
  }
  public static async authenticate(): Promise<void>
  {
    try
    {
      await SequelizeDbConnection.authenticate();
      console.log('Connection has been established successfully.');
    }
    catch(e)
    {
      console.error('Unable to connect to the database:', e);
    }
      
  }
}
