import express from "express";

import { runServer } from "./util/server";
import { createRelations } from "./util/relations";

const app = express();

createRelations();
runServer(app);
