import { DataTypes } from "sequelize";

import { sequelize } from "../util/database";

const Role = sequelize.define("Role", {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Role;
