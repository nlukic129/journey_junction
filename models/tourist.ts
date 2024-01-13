import mongoose, { Schema } from "mongoose";
import { IUser } from "../interface/user";

interface ITourist extends IUser {
  first_name: string;
  last_name: string;
  following: Array<Schema.Types.ObjectId>;
}

const userSchema = new Schema<ITourist>({
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

const UserModel = mongoose.model<ITourist>("Tourist", userSchema);

export default UserModel;
