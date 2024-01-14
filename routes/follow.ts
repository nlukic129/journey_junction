import express from "express";
import { body } from "express-validator";

import { checkAgencyIdValidity, checkTouristIdValidity } from "../util/validators";
import { followAgency, getFollowers, getFollowing, unfollowAgency } from "../controllers/follow";

const followRouter = express.Router();

followRouter.put("/follow-agency", [body("agencyId").custom((value, { req }) => checkAgencyIdValidity(value, req))], followAgency);

followRouter.put("/unfollow-agency", [body("agencyId").custom((value, { req }) => checkAgencyIdValidity(value, req))], unfollowAgency);

followRouter.post("/followers", [body("agencyId").custom((value, { req }) => checkAgencyIdValidity(value, req))], getFollowers);

followRouter.post("/following", [body("touristId").custom((value, { req }) => checkTouristIdValidity(value, req))], getFollowing);

export default followRouter;
