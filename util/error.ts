export const createError = (message: any, statusCode: any, data: any) => {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  return error;
};
