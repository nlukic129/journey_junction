import { Sequelize } from "sequelize";

import config from "../config";

const { name, user, password, host } = config.db;
export const sequelize = new Sequelize(name, user, password, {
  dialect: "mysql",
  host,
});

export const syncDatabase = async () => {
  try {
    // await sequelize.sync({ force: true });
    await sequelize.sync();

    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing with the database:", error);
  }
};
