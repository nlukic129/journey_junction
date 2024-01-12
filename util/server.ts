// import { syncDatabase } from "../database/database";
import CONFIG from "../config";
import mongoose from "mongoose";

export const runServer = async (app: any) => {
  try {
    await mongoose.connect(CONFIG.mongo_db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  } catch (err) {
    console.log(err);
  }
};
