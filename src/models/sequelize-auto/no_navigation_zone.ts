import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, userId } from './user';

export interface NavigationZonesAttributes {
  id: number;
  operator_id: number;
  route: any;
  validity_start?: Date;
  validity_end?: Date;
}

export type noNavZonePk = "id";
export type noNavZoneId = NoNavigationZone[noNavZonePk];
export type noNavZoneOptAttributes = "id" | "validity_start" | "validity_end";
export type noNavZoneCreateAttributes = Optional<NavigationZonesAttributes, noNavZoneOptAttributes>;

export class NoNavigationZone extends Model<NavigationZonesAttributes, noNavZoneCreateAttributes> implements NavigationZonesAttributes {
  id!: number;
  operator_id!: number;
  route!: any;
  validity_start?: Date;
  validity_end?: Date;

  // no_navigation_zone belongsTo user via operator_id
  operator!: User;
  getOperator!: Sequelize.BelongsToGetAssociationMixin<User>;
  setOperator!: Sequelize.BelongsToSetAssociationMixin<User, userId>;
  createOperator!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof NoNavigationZone {
    return NoNavigationZone.init({
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
    sequelize,
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
  });
  }
}
