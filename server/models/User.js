import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = Schema({
     email: {
        type: String
     },
     profilePhoto: {
        type: String//schema options / Field options
     },
     name: {
        type: String
     },
     username: {
      type: String,
      default: ""

     },
     bio: {
      type: String,
      default: ""
     },
     password: {
      type: String,
      default: " "
     }
} ,{ timestamps: true})

export const User = mongoose.model("Users", UserSchema);