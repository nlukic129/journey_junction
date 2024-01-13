import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path";

import CONFIG from "../config";
import { createError } from "./error";

export const sendAccountValidationMail = async (transport: any, userData: any) => {
  try {
    const { user_uuid, role_id, email, username } = userData;

    const token = jwt.sign({ user_uuid, role_id }, CONFIG.jwtSecret, { expiresIn: "24h" });
    const template = await ejs.renderFile(path.resolve(__dirname, "../template/signup-email.ejs"), { name: username, token: token });

    await transport.sendMail({
      from: CONFIG.emailSender,
      to: email,
      subject: "Journey Junction Email Validation",
      html: template,
    });
  } catch (err: any) {
    throw createError("Server Error.", 500, "A server error has occurred, please try again later.");
  }
};

export const sendResendPasswordMail = async (transport: any, userData: any) => {
  try {
    const { user_uuid, email, role_id } = userData;

    const token = jwt.sign({ user_uuid, role_id }, CONFIG.jwtSecret, { expiresIn: "1h" });
    const template = await ejs.renderFile(path.resolve(__dirname, "../template/change-password.ejs"), { token: token });

    await transport.sendMail({
      from: CONFIG.emailSender,
      to: email,
      subject: "Journey Junction Reset Password",
      html: template,
    });
  } catch (err: any) {
    console.log(JSON.stringify(err));
    throw createError("Server Error.", 500, "A server error has occurred, please try again later.");
  }
};
