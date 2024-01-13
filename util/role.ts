import { createError } from "../util/error";
import Role from "../models/role";

import Tourist from "../models/tourist";
import Agency from "../models/agency";
import { UserType } from "../enum/user-type";
import { ErrorMessage } from "../enum/error-type";

export const getModel = async (role_id: any): Promise<typeof Tourist | typeof Agency> => {
  const { role_name }: any = await Role.findById(role_id);

  if (UserType.Agency === role_name) {
    return Agency;
  }

  if (UserType.Tourist === role_name) {
    return Tourist;
  }

  throw createError("User role validation failed.", 422, ErrorMessage.RoleDoesNotExist);
};
