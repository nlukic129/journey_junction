import { validationResult } from "express-validator";
import { createError } from "../util/error";
import TouristModel from "../models/tourist";
import AgencyModel from "../models/agency";

export const followAgency = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const tourist = req.body.user;
    const agency = req.body.agency;

    const isFollowing = tourist.following.includes(agency._id);

    if (isFollowing) {
      throw createError("Following failed.", 400, "You already follow this agency!");
    }

    await tourist.followAgency(agency._id);
    await agency.beFollowed(tourist._id);

    res.status(200).json({ message: "Agency successfully followed." });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const unfollowAgency = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const tourist = req.body.user;
    const agency = req.body.agency;

    const isFollowing = tourist.following.includes(agency._id);

    if (!isFollowing) {
      throw createError("Unfollowing failed.", 400, "You are no longer following this agency!");
    }

    await tourist.unfollowAgency(agency._id);
    await agency.beUnfollowed(tourist._id);

    res.status(200).json({ message: "Agency successfully followed." });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const getFollowers = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const agency = req.body.agency;
    const followersId = agency.followers;

    const followers = await TouristModel.find({ _id: { $in: followersId } }, "username first_name last_name")
      .limit(20)
      .exec();

    res.status(200).json({ followers });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const getFollowing = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw createError("Validation failed.", 422, errors);
    }

    const tourist = req.body.tourist;
    const followingId = tourist.following;

    const following = await AgencyModel.find({ _id: { $in: followingId } }, "username name")
      .limit(20)
      .exec();

    res.status(200).json({ following });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
