import express from "express";
import { body } from "express-validator";

import {
  checkEmailExist,
  checkEmailNotExist,
  checkName,
  checkPasswordMatching,
  checkPasswordSecurity,
  checkRole,
  checkUsernameSecurity,
} from "../util/validators";
import { signup, signIn, validateUser, resendValidation, sendResetPassword, resetPassword, resetPasswordPage } from "../controllers/auth";
import { isAuth } from "../middleware/is-auth";
import { isValidated } from "../middleware/is-validated";
import { ErrorMessage } from "../enum/error-type";
import { UserType } from "../enum/user-type";

const authRouter = express.Router();

authRouter.put(
  "/signup",
  [
    body("role").custom((value, { req }) => checkRole(value, req)),
    body("email")
      .isEmail()
      .withMessage(ErrorMessage.EmailValidation)
      .bail()
      .normalizeEmail()
      .custom((value) => checkEmailNotExist(value)),
    body("password").custom((value) => checkPasswordSecurity(value)),
    body("username")
      .trim()
      .isLength({ min: 4 })
      .withMessage(ErrorMessage.UsernameValidation)
      .bail()
      .custom((value) => checkUsernameSecurity(value)),
    body("first_name").custom((value, { req }) => (req.body.role === UserType.Tourist ? checkName(value, { req }, ErrorMessage.FirstName) : true)),
    body("last_name").custom((value, { req }) => (req.body.role === UserType.Tourist ? checkName(value, { req }, ErrorMessage.LastName) : true)),
    body("name").custom((value, { req }) => (req.body.role === UserType.Agency ? checkName(value, { req }, ErrorMessage.Name) : true)),
  ],
  signup
);

authRouter.post("/sign-in", [body("email").isEmail().withMessage(ErrorMessage.EmailValidation).bail().normalizeEmail()], isAuth, isValidated, signIn);

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
