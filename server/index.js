import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import mongoose, { Collection } from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { authRouter } from "./routes/authRouter.js";
import MongoStore from "connect-mongo";
dotenv.config({ path:"./config.env"});
const app = express();


app.use(
  cors({
    origin: (process.env.NODE_ENV === "development"
      ? process.env.CLIENT_URL_DEV
      : process.env.CLIENT_URL_PROD),
    credentials: true,
    methods: "GET,POST,PUT,DELETE"
  })
);

app.use(
  session({
    resave: false, //changes req,session.cookie when session object is modified
    saveUninitialized: false, //only stores session to session store if modified
    secret: process.env.SECRET,
    store: MongoStore.create({
      mongoUrl: DB,
      collectionName: "sessions"
    }),
  })
);


//DATABASE CONNECTION
const DB = process.env.DB_STRING.replace(
  "<password>",
  process.env.DB_PASSWORD
);
mongoose.connect(DB).then(() => {
  console.log("DATABASE CONNECTION WAS SUCCESSFULL!")
}).catch((error) => {
  console.log(`${error} --- error connecting to DATABASE `)
})

/*passport.use(new GoogleStrategy (
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.NODE_ENV === "development" ? process.env.API_URL_DEV : process.env.API_URL_PROD }`
  },

  async (accessToken , refreshToken , profile , done ) => {
    //You can use the profile information to create or authenticate the user in your data base 
    
    return done(null , profile);
  }
))

passport.serializeUser();

passport.deserializeUser();*/


app.use("/auth" , authRouter);

app.get("/" , (req,res) => {
    console.log("get req received to / endpoint \n");
    res.send("<h1>Hello</h1>");
})

const PORT = process.env.PORT || 6007;

app.listen( PORT , () => {
    console.log(`server listening on port ${PORT} \n`)
} )