import { createError } from "../util/error";
import jwt from "jsonwebtoken";

import CONFIG from "../config";
import { getModel } from "../util/role";

export const isUserLoggedIn = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw createError("Unauthorized", 401, "Token is not exist");
    }

    const decoded: any = jwt.verify(token, CONFIG.jwtSecret);

    const { user_uuid, role_id } = decoded;

    const User: any = await getModel(role_id);

    const user = await User.findById(user_uuid);

    if (user.email.token !== token) {
      throw createError("Unauthorized", 401, "You are not logged in!");
    }

    req.body.user = user;
    next();
  } catch (err: any) {
    if (err.name === "JsonWebTokenError") {
      err = createError("Unauthorized", 401, "Invalid token");
    } else if (err.name === "TokenExpiredError") {
      err = createError("Unauthorized", 401, "Token has expired");
    } else {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
    }
    next(err);
  }
};
