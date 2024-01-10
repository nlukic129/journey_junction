import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user";
import CONFIG from "../config";

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

    const user = await User.create({
      first_name,
      last_name,
      email,
      username,
      password: hashedPw,
      role_id: role_id,
      is_validated: true,
    });

    // TO DO: Sending validation emails

    res.status(201).json({ message: "User created!" });
  } catch (error) {
    throw new Error("Database error");
  }
};

export const signin = async (req: any, res: any, next: any) => {
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
      { expiresIn: "1h" }
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
