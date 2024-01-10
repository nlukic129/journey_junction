export const isValidated = async (req: any, res: any, next: any) => {
  try {
    const isValidated = req.body.user.is_validated;

    if (!isValidated) {
      throw new Error("User is not validated!");
    }

    next();
  } catch (error) {
    throw new Error("Database error");
  }
};
