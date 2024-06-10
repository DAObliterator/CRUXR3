import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo";
import { Server } from "socket.io";
import { createServer } from "http";
import { profileRouter } from "./routes/profileRouter.js";
import { RoomRouter } from "./routes/roomRouter.js";
//import "./utils/passport.js"
import { User } from "./models/User.js";
import { Room } from "./models/Room.js";
dotenv.config({ path: "./config.env" });
const app = express();
const server = createServer(app);

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

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URL_DEV
        : process.env.CLIENT_URL_PROD,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

if (!(process.env.NODE_ENV === "development")) {
  app.set("trust proxy", 1); // you need to add this
}

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === "production" && true, // this is optional it depend which server you host, i am not sure about Heroku if you need it or not
    cookie: {
      secure: "auto",
      maxAge: 1000 * 60 * 60 * 4, // 10 sec for testing
      sameSite: process.env.NODE_ENV === "development" ? false : "none", //by default in developement this is false if you're in developement mode
    },
  })
);

/*app.use(
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
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", // Adjusted for cross-site cookies
      secure: process.env.NODE_ENV === "development" ? false : true, // Cookies sent only over HTTPS in production
    },
  })
);*/

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
      const userExists = await User.findOne({
        email: profile.emails[0].value,
        name: profile.displayName,
      });

      if (!userExists) {
        await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePhoto: profile.photos[0].value,
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

const hostToPodcastMap = {};
const namesToRoomsMap = {};

io.on("connection", (socket) => {
  //only the host emits this event
  socket.on("room-created", (data) => {
    if (!hostToPodcastMap[data.roomID]) {
      hostToPodcastMap[data.roomID] = data;
    }

    console.log(hostToPodcastMap , "hostToPodcastMap --- in room-created")

    socket.join(data.roomID);

    socket.to(data.roomID).emit("host-information", data);
    socket.emit("room-created" , data );
    socket.emit("room-creation-success", data);
  });

  socket.on("created-rooms", () => {
    console.log(
      `${socket.handshake.auth.roomId} in created-rooms `
    );

    console.log(`${JSON.stringify(hostToPodcastMap)} --- hostToPodcastMap`)

    socket.emit("created-rooms", hostToPodcastMap);
  });

  socket.on("join-room", async (data) => {
    console.log(
      `${
        socket.id
      } listening to join-room event from client side ${JSON.stringify(data)}  `
    );

    socket.join(data.roomID);

    const user = await User.findOne({
      name: data.name,
    });

    const currentRoom = await Room.findOneAndUpdate(
      {
        podcastId: data.roomID,
      },
      {
        $addToSet: {
          podcastListeners: user._id,
        },
      }
    );

    console.log(
      `${currentRoom} - in join-room after updating podcastListeners`
    );

    socket
      .to(data.roomID)
      .emit("new-listener", { socketId: socket.id, ...data });

    socket.to(socket.id).emit("joined-room");
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

//so this is where i am making the mistake ?
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URL_DEV + "/authenticate"
        : process.env.CLIENT_URL_PROD + "/authenticate",
  }),
  (req, res) => {
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

app.use("/profile", profileRouter);
app.use("/rooms", RoomRouter);

app.get("/", (req, res) => {
  console.log("get req received to / endpoint \n");
  res.send("<h1>Hello</h1>");
});

const PORT = process.env.PORT || 6007;

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT} \n`);
});
