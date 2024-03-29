import mongoose, { Schema } from "mongoose";
import { IEmail } from "../interface/email";
import { IUser } from "../interface/user";

interface IAgency extends IUser {
  email: IEmail;
  username: string;
  password: string;
  name: string;
  followers: Array<Schema.Types.ObjectId>;
}

const agencySchema = new Schema<IAgency>({
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
  name: String,
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tourist",
    },
  ],
});

agencySchema.methods.beFollowed = async function (touristId: Schema.Types.ObjectId) {
  this.followers.push(touristId);
  await this.save();
};

agencySchema.methods.beUnfollowed = async function (touristId: Schema.Types.ObjectId) {
  this.followers = this.followers.filter((item: Schema.Types.ObjectId) => item.toString() !== touristId.toString());
  await this.save();
};

const AgencyModel = mongoose.model<IAgency>("Agency", agencySchema);

export default AgencyModel;
