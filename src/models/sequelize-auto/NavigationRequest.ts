import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, UserId } from './User'
import { LineString } from 'geojson';
import { NavPlanReqStatus } from '../../enum/NavPlanReqStatus';

export interface NavigationRequestAttributes {
  id?: number;
  userId: number;
  status: NavPlanReqStatus;
  submittedAt: Date;
  dateStart: Date;
  dateEnd: Date;
  droneId: string;
  navigationPlan: LineString;
  motivation?: string|null;
}

export type NavigationRequestPk = "id";
export type NavigationRequestId = NavigationRequest[NavigationRequestPk];
export type NavigationRequestOptionalAttributes = "id" | "status" | "submittedAt" | "motivation";
export type NavigationRequestCreationAttributes = Optional<NavigationRequestAttributes, NavigationRequestOptionalAttributes>;

/**
 * Modello sequelize per le richieste di navigazione effettuate dagli utenti.
 * Consente di mappare la tabella 'navigation_requests' del database con il modello.
 * * @class NavigationRequest
 * Attributi tabella - modello:
 * - id: identificatore univoco e chiave primaria della richiesta.
 * - userId: identificativo dell'utente che ha creato la richiesta.
 * - status: stato della richiesta
 * - submittedAt: data e ora di invio della richiesta al sistema.
 * - dateStart: data e ora di inizio navigazione.
 * - dateEnd: data e ora di fine navigazione.
 * - droneId: codice identificativo del drone con cui la navigazione verrà effettuata.
 * - navigationPlan: geometria del percorso di navigazione.
 * - motivation: motivazione di rigetto della richiesta di navigazione.
 */

export class NavigationRequest extends Model<NavigationRequestAttributes, NavigationRequestCreationAttributes> implements NavigationRequestAttributes {
  id!: number;
  userId!: number;
  status!: NavPlanReqStatus;
  submittedAt!: Date;
  dateStart!: Date;
  dateEnd!: Date;
  droneId!: string;
  navigationPlan!: LineString;
  motivation?: string;

  // NavigationRequest belongsTo User via userId
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof NavigationRequest {
    return sequelize.define('NavigationRequest', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    status: {
      type: DataTypes.ENUM("pending","accepted","rejected","cancelled"),
      allowNull: false,
      defaultValue: "pending"
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'submitted_at'
    },
    dateStart: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_start'
    },
    dateEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_end'
    },
    droneId: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'drone_id'
    },
    navigationPlan: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'navigation_plan'
    },
    motivation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "NULL"
    }
  }, {
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
  }) as typeof NavigationRequest;
  }
}
