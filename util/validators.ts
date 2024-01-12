import jwt from "jsonwebtoken";
import CONFIG from "../config";

import UserModel from "../models/user";
import RoleModel from "../models/role";
import { ErrorMessage } from "../enum/error-type";

export const checkUsernameSecurity = async (value: string) => {
  try {
    const existingUser = await UserModel.findOne({ username: value });

    if (existingUser) {
      return Promise.reject(ErrorMessage.UsernameExist);
    }

    return true;
  } catch (error: any) {
    throw new Error(ErrorMessage.Db);
  }
};

export const checkEmailNotExist = async (value: string) => {
  try {
    const existingUser = await UserModel.findOne({ "email.address": value });

    if (existingUser) {
      return Promise.reject(ErrorMessage.EmailExist);
    }

    return true;
  } catch (error: any) {
    throw new Error(ErrorMessage.Db);
  }
};

export const checkEmailExist = async (value: string) => {
  try {
    const existingUser = await UserModel.findOne({ "email.address": value });

    if (!existingUser) {
      return Promise.reject(ErrorMessage.EmailNotExist);
    }

    return true;
  } catch (error: any) {
    throw new Error(ErrorMessage.Db);
  }
};

export const checkPasswordSecurity = (value: string) => {
  const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!passwordRegex.test(value)) {
    return Promise.reject(ErrorMessage.PswValidation);
  }

  return true;
};

export const checkPasswordMatching = (value: string, password: string) => {
  if (value !== password) {
    return Promise.reject(ErrorMessage.PswNotMatch);
  }
  return true;
};

export const checkRole = async (value: number, req: any) => {
  try {
    const existingRole = await RoleModel.findOne({ role_name: value });

    if (!existingRole) {
      return Promise.reject(ErrorMessage.RoleDoesNotExist);
    }

    req.body.role_id = existingRole._id.toString();

    return true;
  } catch (error: any) {
    throw new Error(ErrorMessage.Db);
  }
};

export const checkName = (firstName: string, req: any, errorMessage: ErrorMessage) => {
  if (!firstName.trim().length) {
    return Promise.reject(errorMessage);
  }
  return true;
};

export const checkTokenValidity = (token: string) => {
  try {
    jwt.verify(token, CONFIG.jwtSecret);
    return true;
  } catch (error) {
    return false;
  }
};
