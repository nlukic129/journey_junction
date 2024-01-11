import { createError } from "../util/error";

export const isValidated = async (req: any, res: any, next: any) => {
  try {
    const isValidated = req.body.user.is_validated;

    if (!isValidated) {
      throw createError("Validation failed.", 422, "User is not validated!");
    }

    next();
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
