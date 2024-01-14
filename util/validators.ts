import jwt from "jsonwebtoken";
import CONFIG from "../config";

import { ErrorMessage } from "../enum/error-type";
import Tourist from "../models/tourist";
import Agency from "../models/agency";

export const checkUsernameNotExist = async (value: string, req: any) => {
  try {
    let existingUser = await Tourist.findOne({ username: value });

    if (existingUser) {
      return Promise.reject(ErrorMessage.UsernameExist);
    }

    existingUser = await Agency.findOne({ username: value });

    if (existingUser) {
      return Promise.reject(ErrorMessage.UsernameExist);
    }

    return true;
  } catch (error: any) {
    throw new Error(ErrorMessage.Db);
  }
};

export const checkEmailNotExist = async (value: string, req: any) => {
  try {
    let existingUser = await Tourist.findOne({ "email.address": value });

    if (existingUser) {
      return Promise.reject(ErrorMessage.EmailExist);
    }

    existingUser = await Agency.findOne({ "email.address": value });

    if (existingUser) {
      return Promise.reject(ErrorMessage.EmailExist);
    }

    return true;
  } catch (error: any) {
    throw new Error(ErrorMessage.Db);
  }
};

export const checkEmailExist = async (value: string, req: any) => {
  try {
    let existingUser = await Tourist.findOne({ "email.address": value });

    if (existingUser) {
      return true;
    }

    existingUser = await Agency.findOne({ "email.address": value });

    if (existingUser) {
      return true;
    }

    return Promise.reject(ErrorMessage.EmailNotExist);
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

export const checkAgencyIdValidity = async (agencyId: string, req: any) => {
  const agency = await Agency.findById(agencyId);

  if (!agency) {
    return Promise.reject("Agency does not exist!");
  }

  req.body.agency = agency;

  return true;
};

export const checkTouristIdValidity = async (touristId: string, req: any) => {
  const tourist = await Tourist.findById(touristId);

  if (!tourist) {
    return Promise.reject("Tourist does not exist!");
  }

  req.body.tourist = tourist;

  return true;
};
