import type { Sequelize } from "sequelize";
import { NavigationRequest as _NavigationRequest } from "./NavigationRequest.js";
import type { NavigationRequestAttributes, NavigationRequestCreationAttributes } from "./NavigationRequest.js";
import { NoNavigationZone as _NoNavigationZone } from "./NoNavigationZone.js";
import type { NoNavigationZoneAttributes, NoNavigationZoneCreationAttributes } from "./NoNavigationZone.js";
import { User as _User } from "./User.js";
import type { UserAttributes, UserCreationAttributes } from "./User.js";

export {
  _NavigationRequest as NavigationRequest,
  _NoNavigationZone as NoNavigationZone,
  _User as User,
};

export type {
  NavigationRequestAttributes,
  NavigationRequestCreationAttributes,
  NoNavigationZoneAttributes,
  NoNavigationZoneCreationAttributes,
  UserAttributes,
  UserCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const NavigationRequest = _NavigationRequest.initModel(sequelize);
  const NoNavigationZone = _NoNavigationZone.initModel(sequelize);
  const User = _User.initModel(sequelize);

  NavigationRequest.belongsTo(User, { foreignKey: "userId"});
  User.hasMany(NavigationRequest, { foreignKey: "userId"});
  NoNavigationZone.belongsTo(User, { foreignKey: "operatorId"});
  User.hasMany(NoNavigationZone, { foreignKey: "operatorId"});

  return {
    NavigationRequest: NavigationRequest,
    NoNavigationZone: NoNavigationZone,
    User: User,
  };
}
