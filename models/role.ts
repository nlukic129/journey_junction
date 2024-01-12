import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  role_id: number;
  role_name: string;
}

const roleSchema = new Schema<IRole>({
  role_name: {
    type: String,
    required: true,
  },
});

const RoleModel = mongoose.model<IRole>("Role", roleSchema);

export default RoleModel;
