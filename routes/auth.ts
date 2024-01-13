import express from "express";
import { body } from "express-validator";

import {
  checkEmailExist,
  checkEmailNotExist,
  checkName,
  checkPasswordMatching,
  checkPasswordSecurity,
  checkUsernameNotExist,
} from "../util/validators";
import { signup, signIn, validateUser, resendValidation, sendResetPassword, resetPassword, resetPasswordPage } from "../controllers/auth";
import { isAuth } from "../middleware/is-auth";
import { isValidated } from "../middleware/is-validated";
import { ErrorMessage } from "../enum/error-type";
import { UserType } from "../enum/user-type";
import { roleChecker } from "../middleware/role-checker";

const authRouter = express.Router();

authRouter.put(
  "/signup",
  roleChecker,
  [
    body("email")
      .isEmail()
      .withMessage(ErrorMessage.EmailValidation)
      .bail()
      .normalizeEmail()
      .custom((value, { req }) => checkEmailNotExist(value, req)),
    body("password").custom((value) => checkPasswordSecurity(value)),
    body("username")
      .trim()
      .isLength({ min: 4 })
      .withMessage(ErrorMessage.UsernameValidation)
      .bail()
      .custom((value, { req }) => checkUsernameNotExist(value, req)),
    body("first_name").custom((value, { req }) => (req.body.role === UserType.Tourist ? checkName(value, { req }, ErrorMessage.FirstName) : true)),
    body("last_name").custom((value, { req }) => (req.body.role === UserType.Tourist ? checkName(value, { req }, ErrorMessage.LastName) : true)),
    body("name").custom((value, { req }) => (req.body.role === UserType.Agency ? checkName(value, { req }, ErrorMessage.Name) : true)),
  ],
  signup
);

authRouter.post("/resend-validation", roleChecker, isAuth, resendValidation);

authRouter.get("/verify/:token", roleChecker, validateUser);

authRouter.post(
  "/sign-in",
  roleChecker,
  [body("email").isEmail().withMessage(ErrorMessage.EmailValidation).bail().normalizeEmail()],
  isAuth,
  isValidated,
  signIn
);

authRouter.post("/send-reset-password", roleChecker, [body("email").custom((value, { req }) => checkEmailExist(value, req))], sendResetPassword);

authRouter.get("/reset-password-page/:token", roleChecker, resetPasswordPage);

authRouter.post(
  "/reset-password/",
  roleChecker,
  body("password").custom((value) => checkPasswordSecurity(value)),
  body("securePassword").custom((value, { req }) => checkPasswordMatching(value, req.body.password)),
  resetPassword
);

export default authRouter;
