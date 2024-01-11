import { Model, ModelCtor } from "sequelize";
import jwt from "jsonwebtoken";
import CONFIG from "../config";

export const checkUsernameSecurity = async (value: string, User: ModelCtor<Model<any, any>>) => {
  try {
    const existingUser = await User.findOne({ where: { username: value } });

    if (existingUser) {
      return Promise.reject("Username address already exists!");
    }

    return true;
  } catch (error) {
    throw new Error("Database error");
  }
};

export const checkEmailNotExist = async (value: string, User: ModelCtor<Model<any, any>>) => {
  try {
    const existingUser = await User.findOne({ where: { email: value } });

    if (existingUser) {
      return Promise.reject("E-Mail address already exists!");
    }

    return true;
  } catch (error: any) {
    throw new Error("Database error");
  }
};

export const checkEmailExist = async (value: string, User: ModelCtor<Model<any, any>>) => {
  try {
    const existingUser = await User.findOne({ where: { email: value } });

    if (!existingUser) {
      return Promise.reject("E-Mail address does not exist!");
    }

    return true;
  } catch (error: any) {
    throw new Error("Database error");
  }
};

export const checkPasswordSecurity = (value: string) => {
  if (value.length < 8) {
    return Promise.reject("Password must be at least 8 characters long.");
  }

  const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!passwordRegex.test(value)) {
    return Promise.reject("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
  }

  return true;
};

export const checkPasswordMatching = (value: string, password: string) => {
  if (value !== password) {
    return Promise.reject("Passwords do not match.");
  }
  return true;
};

export const checkRole = async (value: number, Role: ModelCtor<Model<any, any>>) => {
  try {
    const existingRole = await Role.findByPk(value);

    if (!existingRole) {
      return Promise.reject("The role does not exist");
    }

    return true;
  } catch (error) {
    throw new Error("Database error");
  }
};
