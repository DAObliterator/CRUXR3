import mongoose from "mongoose"
import { Schema } from "mongoose"


const RoomSchema = Schema(
  {
    podcastId: {
        type: String,
        default: ""
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
    },
    speakers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    topic: {
      type: String,
    },
    podcastListeners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestampts: true }
);

export const Room = mongoose.model( "Rooms" , RoomSchema);