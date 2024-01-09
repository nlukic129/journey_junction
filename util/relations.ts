import Role from "../models/role";
import User from "../models/user";

export const createRelations = () => {
  User.belongsTo(Role, { foreignKey: "role_id" });
};
