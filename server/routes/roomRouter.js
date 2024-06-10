import express from "express";
import { Room } from "../models/Room.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/getAllRooms", (req, res) => {});

router.post("/createRoom", async (req, res) => {
  console.log(
    `/rooms/createRoom hit with a post request!!! ${req.isAuthenticated()}  `
  );

  if (req.isAuthenticated()) {
    const currentUser = await User.findOne({
      name: req.user.displayName,
    });

    if (currentUser) {
      const newRoom = await Room.create({
        host: currentUser._id,
        topic: req.body.podcastTopic,
        podcastId: req.body.uniquePodcastId,
      });

      res.status(200).json({ message: "Room Created Successfully" });
    }
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
});

router.post("/getParticipants", async (req, res) => {
  console.log(
    `/rooms/getParticipants hit with a post request!!! ${req.isAuthenticated()}  `
  );

  const { roomID } = req.body;

  if (req.isAuthenticated()) {
    const currentRoom = await Room.findOne({
      podcastId: roomID,
    }).populate(
      {
        path: "podcastListeners",
        select: "name profilePhoto -_id",
      }
     );

     const hostDoc = await User.findOne({
        _id: currentRoom.host 
     }).select('name profilePhoto -_id')


    if (currentRoom) {
      

      res.status(200).json({ allListeners: currentRoom.podcastListeners , host: hostDoc });
    } else {
      res.status(404).json({ message: "room not found" });
    }
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
});

export { router as RoomRouter };
