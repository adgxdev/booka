import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(cors({
  origin: ['https://localhost:3000',],
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());


//Import controllers 


export default app;