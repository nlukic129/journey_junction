import jwt from "jsonwebtoken";

import { ErrorMessage } from "../enum/error-type";
import RoleModel from "../models/role";
import { getModel } from "../util/role";
import CONFIG from "../config";
import { createError } from "../util/error";

export const roleChecker = async (req: any, res: any, next: any) => {
  try {
    const roleId = getRoleId(req);
    const existingRole = await RoleModel.findById(roleId);

    if (!existingRole) {
      return Promise.reject(ErrorMessage.RoleDoesNotExist);
    }

    const User: any = await getModel(roleId);

    req.body.UserModel = User;

    next();
  } catch (error: any) {
    throw createError("Error.", 500, ErrorMessage.Db);
  }
};

const getRoleId = (req: any): string => {
  try {
    if (req.body && req.body.role_id) {
      return req.body.role_id;
    }

    let token = req.params.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (token) {
      const { role_id }: any = jwt.verify(token, CONFIG.jwtSecret);
      if (role_id && typeof role_id === "string" && role_id.length > 0) {
        return role_id;
      }
    }

    return "";
  } catch (err) {
    throw createError("Role error", 422, ErrorMessage.RoleDoesNotExist);
  }
};
