import express from "express";

const router = express.Router();

router.get("/getUserDetails", (req, res) => {
  console.log(`you have hit /getUserDetails endpoint \n`);

  if (req.isAuthenticated()) {
    console.log(`req.user --- ${JSON.stringify(req.user)}`);

    res
      .status(200)
      .json({
        name: req.user.displayName,
        email: req.user.emails[0].value,
        profilePic: req.user.photos[0].value,
      });
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
});

export { router as profileRouter };
