import { Sequelize, DataTypes, Model } from 'sequelize';
import { DatabaseConnection } from './DatabaseConnection';
import { initModels } from '../models/sequelize-auto/init-models';

export class OrmModels
{
    private static sequelize: Sequelize = DatabaseConnection.getInstance();
    
    private constructor(){}

    private static getUserModel()
    {
      return this.sequelize.define('User',
        {
          id:
          {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          email:
          {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: "users_email_key"
          },
          password:
          {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: "users_password_key"
          },
          role:
          {
            type: DataTypes.ENUM("user","operator","admin"),
            allowNull: false
          },
          tokens:
          {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0
          }
        },
        {
          tableName: 'users',
          schema: 'pa2425',
          timestamps: false,
          indexes: [
            {
              name: "users_email_key",
              unique: true,
              fields:
              [
                { name: "email" },
              ]
            },
            {
              name: "users_pkey",
              unique: true,
              fields: [
                { name: "id" },
              ]
            }
          ]
        }
      );
    }
    private static getNavPlanReqModel()
    {
      return this.sequelize.define('NavigationPlanRequest',
        {
          id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            }
          },
          status: {
            type: DataTypes.ENUM("pending","accepted","rejected","cancelled"),
            allowNull: false,
            defaultValue: "pending"
          },
          submitted_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('now')
          },
          date_start: {
            type: DataTypes.DATE,
            allowNull: false
          },
          date_end: {
            type: DataTypes.DATE,
            allowNull: false
          },
          drone_id: {
            type: DataTypes.STRING(10),
            allowNull: false
          },
          navigation_plan: {
            type: DataTypes.GEOMETRY('POLYGON', 4326),
            allowNull: false
          },
          motivation: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "NULL"
          }
        }, 
        {
          tableName: 'navigation_requests',
          schema: 'pa2425',
          timestamps: false,
          indexes: [
            {
              name: "navigation_requests_pkey",
              unique: true,
              fields: [
                { name: "id" },
              ]
            },
          ]
        }
      );
    }

  private static getNoNavZoneModel()
  {
    return this.sequelize.define('NoNavigationZone', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      operator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      route: {
        type: DataTypes.GEOMETRY('POLYGON', 4326),
        allowNull: false
      },
      validity_start: {
        type: DataTypes.DATE,
        allowNull: true
      },
      validity_end: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'no_navigation_zones',
      schema: 'pa2425',
      timestamps: false,
      indexes: [
        {
          name: "no_navigation_zones_pkey",
          unique: true,
          fields: [
            { name: "id" },
            ]
        },
      ]
    }
    );
  }

  public static initModels() {
    return initModels(this.sequelize);
  }
  public static authenticate():void
  {
        this.sequelize.authenticate;
  }
}
