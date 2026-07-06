import cookieParser from "cookie-parser";
import { Application } from "express";
import express from "express";
import cors from "cors";
import config from "./config/config";
import { prisma } from "./lib/prisma";
import { authRouter } from "./module/auth/auth.router";


const app: Application = express();
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.send("Hello World!");
});


app.use('/api/v1/auth', authRouter);

export default app;
