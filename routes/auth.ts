import express from "express";
import { body } from "express-validator";

import User from "../models/user";
import Role from "../models/role";
import { checkEmailSignup, checkPasswordSecurity, checkRole, checkUsernameSecurity } from "../util/validators";
import { signup, signIn } from "../controllers/auth";
import { isAuth } from "../middleware/is-auth";
import { isValidated } from "../middleware/is-validated";

const authRouter = express.Router();

authRouter.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .bail()
      .normalizeEmail()
      .custom((value) => checkEmailSignup(value, User)),
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 5 characters long.")
      .bail()
      .custom((value) => checkPasswordSecurity(value)),
    body("username")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Username must be at least 4 characters long.")
      .bail()
      .custom((value) => checkUsernameSecurity(value, User)),
    body("firstName").trim().not().isEmpty(),
    body("lastName").trim().not().isEmpty(),
    body("roleId").custom((value) => checkRole(value, Role)),
  ],
  signup
);

authRouter.post(
  "/sign-in",
  [
    body("email").isEmail().withMessage("Please enter a valid email.").bail().normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long.")
      .bail()
      .custom((value) => checkPasswordSecurity(value)),
  ],
  isAuth,
  isValidated,
  signIn
);
export default authRouter;
