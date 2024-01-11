import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path";

import CONFIG from "../config";
import { createError } from "./error";

export const sendAccoundValidationMail = async (transport: any, userData: any) => {
  try {
    const { user_uuid, first_name, email } = userData;

    const token = jwt.sign({ user_uuid }, CONFIG.jwtSecret, { expiresIn: "24h" });
    const template = await ejs.renderFile(path.resolve(__dirname, "../template/signup-email.ejs"), { name: first_name, token: token });

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
    const { user_uuid, first_name, email } = userData;

    const token = jwt.sign({ user_uuid }, CONFIG.jwtSecret, { expiresIn: "1h" });
    // TO DO: Napraviti novi template za promenu passworda
    const template = await ejs.renderFile(path.resolve(__dirname, "../template/signup-email.ejs"), { name: first_name, token: token });

    await transport.sendMail({
      from: CONFIG.emailSender,
      to: email,
      subject: "Journey Junction Reset Password",
      html: template,
    });
  } catch (err: any) {
    throw createError("Server Error.", 500, "A server error has occurred, please try again later.");
  }
};
