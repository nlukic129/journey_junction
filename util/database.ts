import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("journey_junction", "root", "nebojsa", {
  dialect: "mysql",
  host: "localhost",
});

export const syncDatabase = async () => {
  try {
    await sequelize.sync();

    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing with the database:", error);
  }
};
