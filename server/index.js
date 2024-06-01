import express from "express";
import dotenv from "dotenv";p
import cors from "cors";
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


app.get("/" , (req,res) => {
    console.log("get req received to / endpoint \n");
    res.send("<h1>Hello</h1>");
})

const PORT = process.env.PORT || 6007;

app.listen( PORT , () => {
    console.log(`server listening on port ${PORT} \n`)
} )