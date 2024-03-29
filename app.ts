import express from "express";
import bodyParser from "body-parser";

import { runServer } from "./util/server";
import authRouter from "./routes/auth";
import { isUserLoggedIn } from "./middleware/is-user-logged-in";
import followRouter from "./routes/follow";

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use("/auth", authRouter);
app.use("/follow", isUserLoggedIn, followRouter);

app.use((error: any, req: any, res: any, next: any) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

runServer(app);
