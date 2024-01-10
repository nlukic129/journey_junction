import { Model, ModelCtor } from "sequelize";

export const checkEmail = async (value: string, User: ModelCtor<Model<any, any>>) => {
  try {
    const existingUser = await User.findOne({ where: { email: value } });

    if (existingUser) {
      throw new Error("E-Mail address already exists!");
    }

    return true;
  } catch (error) {
    throw new Error("Database error");
  }
};

export const checkPasswordSecurity = (value: string): boolean => {
  if (value.length < 5) {
    throw new Error("Password must be at least 5 characters long.");
  }

  const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!passwordRegex.test(value)) {
    throw new Error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
  }

  return true;
};

export const checkRole = async (value: number, Role: ModelCtor<Model<any, any>>) => {
  try {
    const existingRole = await Role.findByPk(value);

    if (!existingRole) {
      throw new Error("The role does not exist");
    }

    return true;
  } catch (error) {
    throw new Error("Database error");
  }
};
