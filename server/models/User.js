import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = Schema({
     email: {
        type: String
     },
     profilePhoto: {
        type: String
     },
     name: {
        type: String
     }
} ,{ timestamps: true})

export const User = mongoose.model("Users", UserSchema);