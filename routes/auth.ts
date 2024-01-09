import express from "express";
import { body } from "express-validator";

import User from "../models/user";
import Role from "../models/role";
import { checkEmail, checkPasswordSecurity, checkRole } from "../util/validators";
import { signup } from "../controllers/auth";

const authRouter = express.Router();

authRouter.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .bail()
      .normalizeEmail()
      .custom((value) => checkEmail(value, User)),

    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long.")
      .bail()
      .custom((value) => checkPasswordSecurity(value)),
    body("firstName").trim().not().isEmpty(),
    body("lastName").trim().not().isEmpty(),
    body("roleId").custom((value) => checkRole(value, Role)),
  ],
  signup
);

export default authRouter;
