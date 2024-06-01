import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/authRouter.js";
dotenv.config({ path:"./config.env"});
const app = express();


app.use(
  cors({
    origin: (process.env.NODE_ENV = "development"
      ? process.env.CLIENT_URL_DEV
      : process.env.CLIENT_URL_PROD),
    credentials: true,
    methods: "GET,POST,PUT,DELETE"
  })
);

app.use(session(
  {
    resave: false, //changes req,session.cookie when session object is modified 
    saveUninitialized:false, //only stores session to session store if modified
    secret: process.env.SECRET
  }
))


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


app.use("/auth" , authRouter);

app.get("/" , (req,res) => {
    console.log("get req received to / endpoint \n");
    res.send("<h1>Hello</h1>");
})

const PORT = process.env.PORT || 6007;

app.listen( PORT , () => {
    console.log(`server listening on port ${PORT} \n`)
} )