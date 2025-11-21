import mongoose from "mongoose";
import type { UserType } from "./userTypes.ts";

const UserSchema = new mongoose.Schema<UserType>(
  {
    name: {
      type: String,
      minLength: 3,
    },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", UserSchema);

export { userModel };
