import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";

import User from "../models/user";
import CONFIG from "../config";
import { createError } from "../util/error";
import { sendAccountValidationMail, sendResendPasswordMail } from "../util/mailer";

const transport = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: CONFIG.sendGridAPIKey,
  })
);

export const signup = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const { email, username, first_name, last_name, password, role_id } = req.body;
    const hashedPw = await bcrypt.hash(password, 12);

    const { user_uuid }: any = await User.create({
      first_name,
      last_name,
      email,
      username,
      password: hashedPw,
      role_id: role_id,
    });

    await sendAccountValidationMail(transport, { user_uuid, first_name, email });

    res.status(201).json({ message: "User created!" });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const signIn = async (req: any, res: any, next: any) => {
  try {
    const { email, username, user_uuid, role_id, first_name, last_name } = req.body.user;

    const token = jwt.sign({ email, username, userId: user_uuid, role: role_id }, CONFIG.jwtSecret, { expiresIn: "5h" });
    const userData = { user_uuid, first_name, last_name, email, role_id };

    res.status(200).json({ status: "success", token: token, userData });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const validateUser = async (req: any, res: any, next: any) => {
  try {
    const { token } = req.params;
    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret);

    const user: any = await User.findByPk(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User does not exist");
    }

    if (!user.is_validated) {
      await User.update({ is_validated: true }, { where: { user_uuid: user_uuid } });
    }

    // Redirect to login
    res.redirect("https://www.youtube.com/");
  } catch (err: any) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      // Redirect to send mail again
      return res.redirect("https://www.udemy.com");
    }

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const resendValidation = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const { user_uuid, email, first_name } = req.body.user;

    await sendAccountValidationMail(transport, { user_uuid, first_name, email });

    res.status(200).json({ message: "Validation email successfully sent." });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const sendResetPassword = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }
    const email = req.body.email;

    const { user_uuid, first_name }: any = await User.findOne({ where: { email } });

    await sendResendPasswordMail(transport, { user_uuid, first_name, email });

    res.status(200).json({ message: "Resend password email successfully sent." });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const resetPasswordPage = async (req: any, res: any, next: any) => {
  try {
    const { token } = req.params;
    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret);

    const user: any = await User.findByPk(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User does not exist");
    }

    // Redirect to change password
    res.redirect("https://chat.openai.com/?token=" + token);
  } catch (err: any) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      // Redirect to send mail again
      return res.redirect("https://www.udemy.com");
    }

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const resetPassword = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const token = req.headers.authorization.split(" ")[1];
    const { password } = req.body;

    if (!token) {
      throw createError("Unauthorized", 401, "Token is not exist");
    }

    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret, (err: any, decoded: any) => {
      if (err) {
        throw createError("Unauthorized", 401, "Token is not valid");
      }

      return decoded;
    });

    const user = await User.findByPk(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User is not exist");
    }

    const hashedPw = await bcrypt.hash(password, 12);

    await User.update({ password: hashedPw }, { where: { user_uuid } });

    res.status(200).json({ message: "User password successfully updated " });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
