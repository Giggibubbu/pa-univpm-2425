import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, UserId } from './User';
import { Polygon } from 'geojson';

export interface NoNavigationZoneAttributes {
  id?: number;
  operatorId?: number;
  route?: Polygon;
  validityStart?: Date | null;
  validityEnd?: Date | null;
}

export type NoNavigationZonePk = "id";
export type NoNavigationZoneId = NoNavigationZone[NoNavigationZonePk];
export type NoNavigationZoneOptionalAttributes = "id" | "validityStart" | "validityEnd";
export type NoNavigationZoneCreationAttributes = Optional<NoNavigationZoneAttributes, NoNavigationZoneOptionalAttributes>;

export class NoNavigationZone extends Model<NoNavigationZoneAttributes, NoNavigationZoneCreationAttributes> implements NoNavigationZoneAttributes {
  id!: number;
  operatorId!: number;
  route!: Polygon;
  validityStart?: Date;
  validityEnd?: Date;

  // NoNavigationZone belongsTo User via operatorId
  operator!: User;
  getOperator!: Sequelize.BelongsToGetAssociationMixin<User>;
  setOperator!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createOperator!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof NoNavigationZone {
    return sequelize.define('NoNavigationZone', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'operator_id'
    },
    route: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    validityStart: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'validity_start'
    },
    validityEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'validity_end'
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
  }) as typeof NoNavigationZone;
  }
}
