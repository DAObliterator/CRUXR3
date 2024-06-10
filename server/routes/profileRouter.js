import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/getUserDetails", (req, res) => {
  console.log(
    req.isAuthenticated(),
    "req.isAuthenticated in /getUserDetails endpoint \n"
  );

  if (req.isAuthenticated()) {
    res.status(200).json({
      name: req.user.displayName,
      email: req.user.emails[0].value,
      profilePic: req.user.photos[0].value,
    });
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
});

router.get("/profileStatus", async (req, res) => {
  console.log(
    `you have hit /profileStatus endpoint ${req.isAuthenticated()} \n`
  );

  if (req.isAuthenticated()) {
    const currentUser = await User.findOne({
      name: req.user.displayName,
    });

    if (currentUser) {
      if (currentUser.bio === "" && currentUser.username === "") {
        res
          .status(200)
          .json({ message: "profile status incomplete", complete: false });
      } else {
        res.status(200).json({
          message: "profile is complete",
          user: currentUser,
          complete: true,
        });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
});

router.post("/completeProfile", async (req, res) => {
  console.log(
    ` /completeProfile hit with a post request ${req.isAuthenticated()} `
  );

  if (req.isAuthenticated()) {
    console.log(
      `req.user (cP) --- ${JSON.stringify(req.user)} in /completeProfile`
    );

    const currentUser = await User.findOne({
      name: req.user.displayName,
      email: req.user.emails[0].value,
    });

    if (currentUser) {
      const updatedUser = await User.findOneAndUpdate(
        {
          name: req.user.displayName,
          email: req.user.emails[0].value,
        },
        { username: req.body.username_, bio: req.body.bio }
      );

      res.status(200).json({
        message: "profile is complete",
        user: updatedUser,
        complete: true,
      });
    } else {
      res.status(404).json({ message: "User not found!" });
    }
  } else {
    res.status(401).json({ message: "Unauthenticated!" });
  }
});

export { router as profileRouter };
