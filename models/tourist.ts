import mongoose, { Schema } from "mongoose";
import { IUser } from "../interface/user";

interface ITourist extends IUser {
  first_name: string;
  last_name: string;
  following: Array<Schema.Types.ObjectId>;

  followAgency(agencyId: Schema.Types.ObjectId): void;
}

const touristSchema = new Schema<ITourist>({
  email: {
    address: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    token: String,
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
  },
  first_name: String,
  last_name: String,
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "Agency",
    },
  ],
});

touristSchema.methods.followAgency = async function (agencyId: Schema.Types.ObjectId) {
  this.following.push(agencyId);
  await this.save();
};

touristSchema.methods.unfollowAgency = async function (agencyId: Schema.Types.ObjectId) {
  this.following = this.following.filter((item: Schema.Types.ObjectId) => item.toString() !== agencyId.toString());
  await this.save();
};

const TouristModel = mongoose.model<ITourist>("Tourist", touristSchema);

export default TouristModel;
