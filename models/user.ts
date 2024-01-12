import mongoose, { Schema, Document } from "mongoose";
import { IRole } from "./role";

interface IUser extends Document {
  user_uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  is_validated: boolean;
  role: mongoose.Types.ObjectId | IRole;
}

const userSchema = new Schema<IUser>({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
  is_validated: {
    type: Boolean,
    default: false,
    required: true,
  },
  // role: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Role",
  // },
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
