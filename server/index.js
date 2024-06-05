import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo";
import { profileRouter } from "./routes/profileRouter.js";
//import "./utils/passport.js"
import { User } from "./models/User.js";
dotenv.config({ path: "./config.env" });
const app = express();

app.use(express.json());

//DATABASE CONNECTION
const DB = process.env.DB_STRING.replace("<password>", process.env.DB_PASSWORD);
mongoose
  .connect(DB)
  .then(() => {
    console.log("DATABASE CONNECTION WAS SUCCESSFULL!");
  })
  .catch((error) => {
    console.log(`${error} --- error connecting to DATABASE `);
  });

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URL_DEV
        : process.env.CLIENT_URL_PROD,
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
  })
);

app.use(
  session({
    resave: false, //changes req,session.cookie when session object is modified
    saveUninitialized: false, //only stores session to session store if modified
    secret: process.env.SECRET,
    store: MongoStore.create({
      mongoUrl: DB,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: process.env.NODE_ENV === "development" ? false : true
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.NODE_ENV === "development"
          ? process.env.API_URL_DEV + "/auth/google/callback"
          : process.env.API_URL_PROD + "/auth/google/callback"
      }`,
    },

    async (accessToken, refreshToken, profile, done) => {
      console.log(profile, " profile info \n");
      const userExists = await User.findOne({
        email: profile.emails[0].value,
        name: profile.displayName
      })

      if (!userExists) {

        await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePhoto: profile.photos[0].value
        });


      }

      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});



app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    access_type: "offline",
    scope: ["email", "profile"],
  }),
  async (req, res) => {
    console.log(`/auth/google/callback hit with a req --- ${JSON.stringify(req.user)} \n`)
    if (!req.user) {
      res.status(400).json({ error: "Authentication failed" });
    } else {
     
      res.redirect(
        process.env.NODE_ENV === "development"
          ? process.env.CLIENT_URL_DEV 
          : process.env.CLIENT_URL_PROD
      );
    }
    // return user details
  }
);

app.use("/profile", profileRouter)

app.get("/", (req, res) => {
  console.log("get req received to / endpoint \n");
  res.send("<h1>Hello</h1>");
});

const PORT = process.env.PORT || 6007;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT} \n`);
});
