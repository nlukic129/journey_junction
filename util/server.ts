import { syncDatabase } from "./database";

export const runServer = async (app: any) => {
  await syncDatabase();

  app.listen(8080, () => {
    console.log("Server is running on port 8080");
  });
};
