import express from "express";
import { body } from "express-validator";

import User from "../models/user";
import Role from "../models/role";
import {
  checkEmailExist,
  checkEmailNotExist,
  checkPasswordMatching,
  checkPasswordSecurity,
  checkRole,
  checkUsernameSecurity,
} from "../util/validators";
import { signup, signIn, validateUser, resendValidation, sendResetPassword, resetPassword, resetPasswordPage } from "../controllers/auth";
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
      .custom((value) => checkEmailNotExist(value)),
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
      .custom((value) => checkUsernameSecurity(value)),
    body("first_name").trim().not().isEmpty(),
    body("last_name").trim().not().isEmpty(),
    body("role_id").custom((value) => checkRole(value)),
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

authRouter.get("/verify/:token", validateUser);

authRouter.post("/resend-validation", isAuth, resendValidation);

authRouter.post(
  "/send-reset-password",
  body("email").custom((value) => checkEmailExist(value)),
  sendResetPassword
);

authRouter.get("/reset-password-page/:token", resetPasswordPage);

authRouter.post(
  "/reset-password",
  body("password").custom((value) => checkPasswordSecurity(value)),
  body("securePassword").custom((value, { req }) => checkPasswordMatching(value, req.body.password)),
  resetPassword
);

export default authRouter;
