import { sequelize } from "../connector/SequelizeDbConnection";
import { initModels } from "../models/sequelize-auto/init-models";


export class OrmModels
{
  private constructor(){}

  public static initModels()
  {
    return initModels(sequelize);
  }
  public static async authenticate(): Promise<void>
  {
    try
    {
      await sequelize.authenticate();
    }
    catch(e)
    {
      console.log("Errore di connessione al database", e);
    }
      
  }
}
