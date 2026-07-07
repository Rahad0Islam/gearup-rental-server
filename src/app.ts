import cookieParser from "cookie-parser";
import { Application } from "express";
import express from "express";
import cors from "cors";
import config from "./config/config";
import { authRouter } from "./module/auth/auth.router";
import { gearRouter } from "./module/gear/gear.router";
import { categoryRouter } from "./module/category/category.router";
import { rentalOrderRouter } from "./module/rentalOrder/rentalOrder.router";


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
app.use('/api/v1/gear', gearRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/rental-order', rentalOrderRouter);

export default app;
