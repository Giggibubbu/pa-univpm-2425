import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { NavigationRequest, navigation_requestId } from './navigation_request';
import type { NoNavigationZone, noNavZoneId } from './no_navigation_zone';

export interface UserFields {
  id: number;
  email: string;
  password: string;
  role: "user" | "operator" | "admin";
  tokens: number;
}

export type userPk = "id";
export type userId = User[userPk];
export type userOptAttributes = "id" | "tokens";
export type userCreateAttributes = Optional<UserFields, userOptAttributes>;

export class User extends Model<UserFields, userCreateAttributes> implements UserFields {
  id!: number;
  email!: string;
  password!: string;
  role!: "user" | "operator" | "admin";
  tokens!: number;

  // user hasMany navigation_request via user_id
  navigation_requests!: NavigationRequest[];
  getNavigation_requests!: Sequelize.HasManyGetAssociationsMixin<NavigationRequest>;
  setNavigation_requests!: Sequelize.HasManySetAssociationsMixin<NavigationRequest, navigation_requestId>;
  addNavigation_request!: Sequelize.HasManyAddAssociationMixin<NavigationRequest, navigation_requestId>;
  addNavigation_requests!: Sequelize.HasManyAddAssociationsMixin<NavigationRequest, navigation_requestId>;
  createNavigation_request!: Sequelize.HasManyCreateAssociationMixin<NavigationRequest>;
  removeNavigation_request!: Sequelize.HasManyRemoveAssociationMixin<NavigationRequest, navigation_requestId>;
  removeNavigation_requests!: Sequelize.HasManyRemoveAssociationsMixin<NavigationRequest, navigation_requestId>;
  hasNavigation_request!: Sequelize.HasManyHasAssociationMixin<NavigationRequest, navigation_requestId>;
  hasNavigation_requests!: Sequelize.HasManyHasAssociationsMixin<NavigationRequest, navigation_requestId>;
  countNavigation_requests!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany no_navigation_zone via operator_id
  no_navigation_zones!: NoNavigationZone[];
  getNo_navigation_zones!: Sequelize.HasManyGetAssociationsMixin<NoNavigationZone>;
  setNo_navigation_zones!: Sequelize.HasManySetAssociationsMixin<NoNavigationZone, noNavZoneId>;
  addNo_navigation_zone!: Sequelize.HasManyAddAssociationMixin<NoNavigationZone, noNavZoneId>;
  addNo_navigation_zones!: Sequelize.HasManyAddAssociationsMixin<NoNavigationZone, noNavZoneId>;
  createNo_navigation_zone!: Sequelize.HasManyCreateAssociationMixin<NoNavigationZone>;
  removeNo_navigation_zone!: Sequelize.HasManyRemoveAssociationMixin<NoNavigationZone, noNavZoneId>;
  removeNo_navigation_zones!: Sequelize.HasManyRemoveAssociationsMixin<NoNavigationZone, noNavZoneId>;
  hasNo_navigation_zone!: Sequelize.HasManyHasAssociationMixin<NoNavigationZone, noNavZoneId>;
  hasNo_navigation_zones!: Sequelize.HasManyHasAssociationsMixin<NoNavigationZone, noNavZoneId>;
  countNo_navigation_zones!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof User {
    return User.init({
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
    sequelize,
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
  });
  }
}
