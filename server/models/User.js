import mongoose from "mongoose";
import { Schema } from "mongoose";


const UserSchema = Schema({
     email: {
        type: String
     },
     profilePhoto: {
        type: String
     }
} ,{ timestamps: true})