import { sequelize } from "../connector/SequelizeDbConnection";
import { initModels } from "../models/sequelize-auto/init-models";

/**
 * Classe statica utilizzata dai DAO che centralizza le operazioni di
 * configurazione dei modelli e di verifica della connessione.
 * @class OrmModels
 */

export class OrmModels
{
  private constructor(){}

  /**
   * Inizializza tutti i modelli mappati nel database.
   * Collega le definizioni generate automaticamente all'istanza singleton di Sequelize.
   * * @returns Un oggetto contenente tutti i modelli inizializzati.
   */
  public static initModels()
  {
    return initModels(sequelize);
  }

  /**
   * Verifica lo stato della connessione al database
   * eseguendo un test di autenticazione verso il server PostgreSQL.
   */
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
