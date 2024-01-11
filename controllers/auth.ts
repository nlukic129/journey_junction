import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";
import ejs from "ejs";
import path from "path";

import User from "../models/user";
import CONFIG from "../config";

const transport = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: CONFIG.sendGridAPIKey,
  })
);

export const signup = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      throw error;
    }

    const email = req.body.email;
    const username = req.body.username;
    const first_name = req.body.firstName;
    const last_name = req.body.lastName;
    const password = req.body.password;
    const role_id = req.body.roleId;

    const hashedPw = await bcrypt.hash(password, 12);

    const { user_uuid }: any = await User.create({
      first_name,
      last_name,
      email,
      username,
      password: hashedPw,
      role_id: role_id,
    });

    const token = jwt.sign({ user_uuid }, CONFIG.jwtSecret, { expiresIn: "24h" });

    const relativePath = "../template/signup-email.ejs";
    const absolutePath = path.resolve(__dirname, relativePath);
    const template = await ejs.renderFile(absolutePath, { name: first_name, token: token });

    await transport.sendMail({
      from: CONFIG.emailSender,
      to: email,
      subject: "Journey Junction Email Validation",
      html: template,
    });

    res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.log(error);
    throw new Error("Database error");
  }
};

export const signIn = async (req: any, res: any, next: any) => {
  try {
    const user = req.body.user;

    const token = jwt.sign(
      {
        email: user.email,
        username: user.username,
        userId: user.user_uuid,
        role: user.role_id,
      },
      CONFIG.jwtSecret,
      { expiresIn: "5h" }
    );

    const userData = {
      user_uuid: user.user_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role_id: user.role_id,
    };

    res.status(200).json({ status: "success", token: token, userData });
  } catch (error) {
    throw new Error("Database error");
  }
};

export const validateUser = async (req: any, res: any, next: any) => {
  try {
    const { token } = req.params;
    const { user_uuid }: any = jwt.verify(token, CONFIG.jwtSecret);

    const user: any = await User.findByPk(user_uuid);

    if (!user) {
      throw new Error("User does not exist");
    }

    if (!user.is_validated) {
      await User.update({ is_validated: true }, { where: { user_uuid: user_uuid } });
    }

    res.redirect("https://www.youtube.com/");
  } catch (err: any) {
    console.log(err);
  }
};
