import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";

import User from "../models/user";
import CONFIG from "../config";
import { createError } from "../util/error";
import { sendAccountValidationMail, sendResendPasswordMail } from "../util/mailer";
import UserModel from "../models/user";
import RoleModel from "../models/role";
import { checkTokenValidity } from "../util/validators";

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

    const { email, username, first_name, last_name, password, role_id, name } = req.body;
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      first_name,
      last_name,
      name,
      email: {
        address: email,
        verified: false,
      },
      username,
      password: hashedPw,
      role: role_id,
    });

    await user.save();

    const user_uuid = user._id.toString();

    await sendAccountValidationMail(transport, { user_uuid, username, email });

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
    const { user } = req.body;
    const { email, username, _id, role, first_name, last_name, name } = user;
    let token = email.token;

    const { role_name }: any = await RoleModel.findById(role);

    if (token && checkTokenValidity(token)) {
      return res.status(200).json({
        status: "success",
        token: token,
        usedData: { email, username, _id, role_name, first_name, last_name, name },
        message: "You are already logged in",
      });
    }

    token = jwt.sign({ email, username, userId: _id.toString(), role: role }, CONFIG.jwtSecret, { expiresIn: "5h" });

    user.email.token = token;
    await user.save();

    res.status(200).json({ status: "success", token: token, userData: { user_uuid: _id.toString(), first_name, last_name, email, role_name, name } });
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

    const user = await UserModel.findById(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User does not exist");
    }

    if (!user.email.verified) {
      user.email.verified = true;
      await user.save();
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

    const { _id, email, first_name } = req.body.user;

    await sendAccountValidationMail(transport, { user_uuid: _id.toString(), first_name, email: email.address });

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

    const { _id, first_name }: any = await User.findOne({ email });

    await sendResendPasswordMail(transport, { user_uuid: _id.toString(), first_name, email });

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

    const user = await UserModel.findById(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User does not exist");
    }

    // Redirect to change password
    res.redirect(`https://chat.openai.com/?token=${token}`);
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

    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret);

    const user = await UserModel.findById(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User is not exist");
    }

    const hashedPw = await bcrypt.hash(password, 12);

    user.password = hashedPw;
    user.save();

    res.status(200).json({ message: "User password successfully updated" });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
