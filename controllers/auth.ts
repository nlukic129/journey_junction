import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";
import { ObjectId } from "mongodb";

import CONFIG from "../config";
import { createError } from "../util/error";
import { sendAccountValidationMail, sendResendPasswordMail } from "../util/mailer";
import { checkTokenValidity } from "../util/validators";
import { getModel } from "../util/role";

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

    const User: any = req.body.UserModel;

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
      role: new ObjectId(role_id),
    });

    await user.save();

    await sendAccountValidationMail(transport, { user_uuid: user._id.toString(), role_id, email, username });

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
    const { email, _id, role } = user;
    let token = email.token;

    if (token && checkTokenValidity(token)) {
      return res.status(200).json({
        status: "success",
        token: token,
        message: "You are already logged in",
      });
    }
    token = jwt.sign({ user_uuid: _id.toString(), role_id: role.toString() }, CONFIG.jwtSecret, { expiresIn: "5h" });

    user.email.token = token;
    await user.save();

    res.status(200).json({ status: "success", token: token });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const signOut = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret);

    const User: any = req.body.UserModel;

    const user = await User.findById(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User does not exist");
    }

    user.email.token = "";
    await user.save();

    res.status(200).json({ message: "User is logged out" });
  } catch (err: any) {
    if (err.name === "JsonWebTokenError") {
      err = createError("Unauthorized", 401, "Invalid token");
    } else if (err.name === "TokenExpiredError") {
      err = createError("Unauthorized", 401, "Token has expired");
    } else {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
    }
    next(err);
  }
};

export const validateUser = async (req: any, res: any, next: any) => {
  try {
    const { token } = req.params;
    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret);

    const User: any = req.body.UserModel;

    const user = await User.findById(user_uuid);

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

    const { _id, email, username, role } = req.body.user;

    const user_uuid = _id ? _id.toString() : "";
    const role_id = role ? role.toString() : "";
    await sendAccountValidationMail(transport, { user_uuid, role_id, email, username });

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
    const User: any = req.body.UserModel;

    const { _id, first_name, role }: any = await User.findOne({ "email.address": email });

    await sendResendPasswordMail(transport, { user_uuid: _id.toString(), first_name, email, role_id: role.toString() });

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

    const User: any = req.body.UserModel;

    const user = await User.findById(user_uuid);

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

    const User: any = req.body.UserModel;

    const token = req.headers.authorization.split(" ")[1];
    const { password } = req.body;

    if (!token) {
      throw createError("Unauthorized", 401, "Token is not exist");
    }

    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret);

    const user = await User.findById(user_uuid);

    if (!user) {
      throw createError("Validation failed.", 422, "User is not exist");
    }

    const hashedPw = await bcrypt.hash(password, 12);

    user.password = hashedPw;
    user.save();

    res.status(200).json({ message: "User password successfully updated" });
  } catch (err: any) {
    if (err.name === "JsonWebTokenError") {
      err = createError("Unauthorized", 401, "Invalid token");
    } else if (err.name === "TokenExpiredError") {
      err = createError("Unauthorized", 401, "Token has expired");
    } else {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
    }
    next(err);
  }
};
