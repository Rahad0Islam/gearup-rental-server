import cookieParser from "cookie-parser";
import { Application } from "express";
import express from "express";
import cors from "cors";
import config from "./config/config";
import { authRouter } from "./module/auth/auth.router";
import { gearRouter } from "./module/gear/gear.router";
import { categoryRouter } from "./module/category/category.router";
import { rentalOrderRouter } from "./module/rentalOrder/rentalOrder.router";
import { paymentRouter } from "./module/payment/payment.router";
import { reviewRouter } from "./module/review/review.router";


const app: Application = express();
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);


app.use('/api/v1/payment/webhook',express.raw({ type: 'application/json' }));

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
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/review', reviewRouter);

export default app;
