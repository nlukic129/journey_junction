import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../enum/user-type";
import { IEmail } from "../interface/email";

interface IUser extends Document {
  type: UserType;
  email: IEmail;
  username: string;
  password: string;
  role: Schema.Types.ObjectId;
  name: string;
  first_name: string;
  last_name: string;
  following: Array<Schema.Types.ObjectId>;
  followers: Array<Schema.Types.ObjectId>;
}

const userSchema = new Schema<IUser>({
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
  first_name: String,
  last_name: String,
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
