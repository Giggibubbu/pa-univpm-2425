import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, userId } from './user';

export interface NavReqAttributes {
  id: number;
  user_id: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  submitted_at: Date;
  date_start: Date;
  date_end: Date;
  drone_id: string;
  navigation_plan: any;
  motivation?: string;
}

export type navigation_requestPk = "id";
export type navigation_requestId = NavigationRequest[navigation_requestPk];
export type navigation_requestOptionalAttributes = "id" | "status" | "submitted_at" | "motivation";
export type navigation_requestCreationAttributes = Optional<NavReqAttributes, navigation_requestOptionalAttributes>;

export class NavigationRequest extends Model<NavReqAttributes, navigation_requestCreationAttributes> implements NavReqAttributes {
  id!: number;
  user_id!: number;
  status!: "pending" | "accepted" | "rejected" | "cancelled";
  submitted_at!: Date;
  date_start!: Date;
  date_end!: Date;
  drone_id!: string;
  navigation_plan!: any;
  motivation?: string;

  // navigation_request belongsTo user via user_id
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof NavigationRequest {
    return NavigationRequest.init({
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
      defaultValue: Sequelize.Sequelize.fn('now')
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
  }, {
    sequelize,
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
  });
  }
}
