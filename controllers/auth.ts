import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/user";

export const signup = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      throw error;
    }

    const email = req.body.email;
    const first_name = req.body.firstName;
    const last_name = req.body.lastName;
    const password = req.body.password;
    const role_id = req.body.roleId;

    const hashedPw = await bcrypt.hash(password, 12);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPw,
      role_id: role_id,
    });

    // TO DO: Sending validation emails

    res.status(201).json({ message: "User created!" });
  } catch (error) {
    throw new Error("Database error");
  }
};
