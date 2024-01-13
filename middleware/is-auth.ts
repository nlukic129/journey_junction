import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import { createError } from "../util/error";

export const isAuth = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    const User: any = req.body.UserModel;

    const existingUser: any = await User.findOne({ "email.address": email });

    if (!existingUser) {
      throw createError("Validation failed.", 422, "A user with this e-mail could not be found.");
    }

    const isPwEqual = await bcrypt.compare(password, existingUser.password);

    if (!isPwEqual) {
      throw createError("Validation failed.", 422, "Wrong password!");
    }

    req.body.user = existingUser;

    next();
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
