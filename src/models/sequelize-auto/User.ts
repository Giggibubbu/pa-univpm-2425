import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { NavigationRequest, NavigationRequestId } from './NavigationRequest';
import type { NoNavigationZone, NoNavigationZoneId } from './NoNavigationZone';

export interface UserAttributes {
  id: number;
  email: string;
  password?: string;
  role: "user" | "operator" | "admin";
  tokens: number;
}

export type UserPk = "id";
export type UserId = User[UserPk];
export type UserOptionalAttributes = "id" | "tokens";
export type UserCreationAttributes = Optional<UserAttributes, UserOptionalAttributes>;

/**
 * Modello sequelize per la gestione degli utenti del sistema.
 * Consente di mappare la tabella 'users' del database con il modello.
 * * @class User
 * Attributi tabella - modello:
 * - id: identificatore univoco e chiave primaria dell'utente.
 * - email: indirizzo email dell'utente, utilizzato per l'accesso al sistema.
 * - password: password cifrata dell'utente per l'autenticazione.
 * - role: ruolo assegnato all'utente (user, operator, admin) che ne definisce i permessi.
 * - tokens: credito disponibile per l'utente per l'effettuazione di richieste di navigazione.
 */

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;
  email!: string;
  password!: string;
  role!: "user" | "operator" | "admin";
  tokens!: number;

  // User hasMany NavigationRequest via userId
  navigationRequests!: NavigationRequest[];
  getNavigationRequests!: Sequelize.HasManyGetAssociationsMixin<NavigationRequest>;
  setNavigationRequests!: Sequelize.HasManySetAssociationsMixin<NavigationRequest, NavigationRequestId>;
  addNavigationRequest!: Sequelize.HasManyAddAssociationMixin<NavigationRequest, NavigationRequestId>;
  addNavigationRequests!: Sequelize.HasManyAddAssociationsMixin<NavigationRequest, NavigationRequestId>;
  createNavigationRequest!: Sequelize.HasManyCreateAssociationMixin<NavigationRequest>;
  removeNavigationRequest!: Sequelize.HasManyRemoveAssociationMixin<NavigationRequest, NavigationRequestId>;
  removeNavigationRequests!: Sequelize.HasManyRemoveAssociationsMixin<NavigationRequest, NavigationRequestId>;
  hasNavigationRequest!: Sequelize.HasManyHasAssociationMixin<NavigationRequest, NavigationRequestId>;
  hasNavigationRequests!: Sequelize.HasManyHasAssociationsMixin<NavigationRequest, NavigationRequestId>;
  countNavigationRequests!: Sequelize.HasManyCountAssociationsMixin;
  // User hasMany NoNavigationZone via operatorId
  noNavigationZones!: NoNavigationZone[];
  getNoNavigationZones!: Sequelize.HasManyGetAssociationsMixin<NoNavigationZone>;
  setNoNavigationZones!: Sequelize.HasManySetAssociationsMixin<NoNavigationZone, NoNavigationZoneId>;
  addNoNavigationZone!: Sequelize.HasManyAddAssociationMixin<NoNavigationZone, NoNavigationZoneId>;
  addNoNavigationZones!: Sequelize.HasManyAddAssociationsMixin<NoNavigationZone, NoNavigationZoneId>;
  createNoNavigationZone!: Sequelize.HasManyCreateAssociationMixin<NoNavigationZone>;
  removeNoNavigationZone!: Sequelize.HasManyRemoveAssociationMixin<NoNavigationZone, NoNavigationZoneId>;
  removeNoNavigationZones!: Sequelize.HasManyRemoveAssociationsMixin<NoNavigationZone, NoNavigationZoneId>;
  hasNoNavigationZone!: Sequelize.HasManyHasAssociationMixin<NoNavigationZone, NoNavigationZoneId>;
  hasNoNavigationZones!: Sequelize.HasManyHasAssociationsMixin<NoNavigationZone, NoNavigationZoneId>;
  countNoNavigationZones!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof User {
    return sequelize.define('User', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: "users_email_key"
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("user","operator","admin"),
      allowNull: false
    },
    tokens: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'users',
    schema: 'pa2425',
    timestamps: false,
    indexes: [
      {
        name: "users_email_key",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "users_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof User;
  }
}
