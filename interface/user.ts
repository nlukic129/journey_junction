import { Schema } from "mongoose";
import { IEmail } from "./email";

export interface IUser extends Document {
  email: IEmail;
  username: string;
  password: string;
  role: Schema.Types.ObjectId;
}
