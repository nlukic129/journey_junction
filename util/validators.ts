import UserModel from "../models/user";
import RoleModel from "../models/role";

export const checkUsernameSecurity = async (value: string) => {
  try {
    const existingUser = await UserModel.findOne({ username: value });

    if (existingUser) {
      return Promise.reject("Username already exists!");
    }

    return true;
  } catch (error: any) {
    throw new Error("Database error");
  }
};

export const checkEmailNotExist = async (value: string) => {
  try {
    const existingUser = await UserModel.findOne({ email: value });

    if (existingUser) {
      return Promise.reject("E-Mail address already exists!");
    }

    return true;
  } catch (error: any) {
    throw new Error("Dat abase error");
  }
};

export const checkEmailExist = async (value: string) => {
  try {
    const existingUser = await UserModel.findOne({ email: value });

    if (!existingUser) {
      return Promise.reject("E-Mail does not already exists!");
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

export const checkRole = async (value: number) => {
  try {
    const existingRole = await RoleModel.findById(value);

    if (!existingRole) {
      return Promise.reject("The role does not exist");
    }

    return true;
  } catch (error: any) {
    throw new Error("Database error");
  }
};
