import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import User from "../models/user";

export const isAuth = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      throw error;
    }

    const email = req.body.email;
    const password = req.body.password;

    const existingUser: any = await User.findOne({ where: { email } });

    if (!existingUser) {
      throw new Error("A user with this e-mail could not be found.");
    }

    const isPwEqual = await bcrypt.compare(password, existingUser.password);

    if (!isPwEqual) {
      throw new Error("Wrong password!");
    }

    req.body.user = existingUser;

    next();
  } catch (error) {
    throw new Error("Database error");
  }
};
