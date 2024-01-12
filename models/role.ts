import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../enum/user-type";

export interface IRole extends Document {
  role_name: UserType;
}

const roleSchema = new Schema<IRole>({
  role_name: { type: String, required: true, enum: Object.values(UserType) },
});

const RoleModel = mongoose.model<IRole>("Role", roleSchema);

export default RoleModel;
