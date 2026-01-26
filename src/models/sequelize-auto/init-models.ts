import type { Sequelize } from "sequelize";
import { NavigationRequest as navReq } from "./navigation_request";
import type { NavReqAttributes, navigation_requestCreationAttributes } from "./navigation_request";
import { NoNavigationZone as noNavZone } from "./no_navigation_zone";
import type { NavigationZonesAttributes, noNavZoneCreateAttributes } from "./no_navigation_zone";
import { User as user } from "./user";
import type { UserFields, userCreateAttributes } from "./user";

export type {
  NavReqAttributes as navigation_requestAttributes,
  navigation_requestCreationAttributes,
  NavigationZonesAttributes as no_navigation_zoneAttributes,
  noNavZoneCreateAttributes as no_navigation_zoneCreationAttributes,
  UserFields as userAttributes,
  userCreateAttributes as userCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const navReqModelInstance = navReq.initModel(sequelize);
  const noNavModelInstance = noNavZone.initModel(sequelize);
  const userModelInstance = user.initModel(sequelize);

  navReqModelInstance.belongsTo(userModelInstance, { as: "user", foreignKey: "user_id"});
  userModelInstance.hasMany(navReqModelInstance, { as: "navigation_requests", foreignKey: "user_id"});
  noNavModelInstance.belongsTo(userModelInstance, { as: "operator", foreignKey: "operator_id"});
  userModelInstance.hasMany(noNavModelInstance, { as: "no_navigation_zones", foreignKey: "operator_id"});

  return {
    navReqModelInstance: navReqModelInstance,
    noNavModelInstance: noNavModelInstance,
    user: userModelInstance,
  };
}
